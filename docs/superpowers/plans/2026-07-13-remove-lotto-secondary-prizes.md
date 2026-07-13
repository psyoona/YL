# Lotto 2등·3등 노출 제거 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `Laboratory/Lotto`의 결과 목록, CSV, 계산기, 과거 당첨 이력과 관련 API에서 2등·3등 데이터를 제거한다.

**Architecture:** 데이터베이스 스키마는 그대로 두고 `LottoService`가 필요한 1등 중심 열만 명시적으로 조회한다. DTO와 JSON 계약에서 2등·3등 필드를 제거하고 Razor/JavaScript/CSS도 같은 표시 정책을 따르게 한다.

**Tech Stack:** ASP.NET Core 8 MVC, C# 12, Razor, JavaScript, xUnit, SQL Server.

## Global Constraints

- 현재 `master`에서 직접 수정한다.
- 워크트리, 스테이징, 커밋을 생성하지 않는다.
- 데이터베이스 스키마와 기존 행을 변경하지 않는다.
- 기존 `Properties/PublishProfiles/ReleaseProfile.pubxml.user` 변경을 보존한다.
- LottoDrawer 프로젝트는 변경하지 않는다.

---

### Task 1: 서버와 API 계약에서 2등·3등 제거

**Files:**
- Create: `YL.Tests/LottoDisplayContractTests.cs`
- Modify: `Models/Dtos/Webs/LottoInformation.cs`
- Modify: `Services/LottoService.cs`

**Interfaces:**
- Consumes: `HWSY.dbo.Lotto_Information`의 기존 열.
- Produces: `LottoInformation` JSON과 Lotto 서비스 결과에서 `Reward1`만 노출하는 계약.

- [x] **Step 1: DTO와 서비스 의존성을 검증하는 실패 테스트 작성**

```csharp
using System.Text.Json;
using YL.Functions;
using YL.Models.Dtos.Webs;

namespace YL.Tests;

public class LottoDisplayContractTests
{
	[Fact]
	public void Lotto_payload_exposes_only_first_prize()
	{
		string json = JsonSerializer.Serialize(
			new LottoInformation { Reward1 = 1_000 },
			new JsonSerializerOptions { PropertyNamingPolicy = new UpperCaseNamingPolicy() });
		using JsonDocument document = JsonDocument.Parse(json);
		string[] propertyNames = document.RootElement
			.EnumerateObject()
			.Select(property => property.Name)
			.ToArray();

		Assert.Contains("REWARD1", propertyNames);
		Assert.DoesNotContain("REWARD2", propertyNames);
		Assert.DoesNotContain("REWARD3", propertyNames);
	}

	[Fact]
	public void Lotto_service_does_not_depend_on_secondary_prizes()
	{
		string service = ReadRepositoryFile("Services", "LottoService.cs");

		Assert.DoesNotContain("Reward2", service);
		Assert.DoesNotContain("Reward3", service);
		Assert.DoesNotContain("2등", service);
		Assert.DoesNotContain("3등", service);
	}

	private static string ReadRepositoryFile(params string[] segments)
	{
		DirectoryInfo directory = new DirectoryInfo(AppContext.BaseDirectory);
		while (directory != null && !File.Exists(Path.Combine(directory.FullName, "YL.sln")))
		{
			directory = directory.Parent;
		}

		Assert.NotNull(directory);
		return File.ReadAllText(Path.Combine(new[] { directory.FullName }.Concat(segments).ToArray()));
	}
}
```

- [x] **Step 2: 대상 테스트가 기존 2등·3등 계약 때문에 실패하는지 확인**

Run:

```powershell
dotnet test YL.Tests/YL.Tests.csproj --filter "FullyQualifiedName~Lotto_payload_exposes_only_first_prize|FullyQualifiedName~Lotto_service_does_not_depend_on_secondary_prizes"
```

Expected: 두 테스트 모두 실패하고 출력에 `reward2` 또는 `Reward2`가 남아 있음을 보여준다.

- [x] **Step 3: DTO에서 2등·3등 속성 제거**

`Models/Dtos/Webs/LottoInformation.cs`에는 아래 상금 속성만 유지한다.

```csharp
public long Reward1 { get; set; }
```

- [x] **Step 4: Lotto 조회 열을 명시적인 1등 중심 프로젝션으로 변경**

`LottoService`에 공통 열을 정의한다.

```csharp
private const string LottoColumns =
	"Turn, Number1, Number2, Number3, Number4, Number5, Number6, NumberBonus, Date, Reward1";
```

목록 쿼리는 파생 테이블 안팎에서 필요한 열만 선택한다.

```csharp
string query = $@"
	SELECT {LottoColumns}, RowNum
	FROM (
		SELECT {LottoColumns}, ROW_NUMBER() OVER (ORDER BY Turn DESC) AS RowNum
		FROM HWSY.dbo.Lotto_Information
		{whereClause}
	) AS NumberedResults
	WHERE RowNum BETWEEN ((@PageNumber - 1) * @PageSize + 1) AND (@PageNumber * @PageSize)
	ORDER BY Turn DESC";
```

단건과 최근 회차 쿼리도 각각 `SELECT {LottoColumns}`와 `SELECT TOP (@Count) {LottoColumns}`를 사용한다.

- [x] **Step 5: 번호 조합 이력을 1등만 판정하도록 축소**

조합 이력 쿼리에서는 `Reward1`만 조회하고 아래 조건에서만 결과를 만든다.

```csharp
if (matchCount == 6)
{
	Dictionary<string, object> match = new Dictionary<string, object>();
	match["TURN"] = reader["Turn"];
	match["DATE"] = reader["Date"];
	match["RANK"] = "1등";
	match["REWARD"] = reader["Reward1"];
	match["MATCH_COUNT"] = matchCount;
	matches.Add(match);
	result["RANK"] = "1등";
}
```

보너스 일치 계산, 2등·3등 분기와 우선순위 비교를 제거한다.

- [x] **Step 6: 평균 당첨금 조회를 1등으로 제한**

```csharp
string query = @"
	SELECT AVG(CAST(Reward1 AS BIGINT)) AS AvgReward1
	FROM HWSY.dbo.Lotto_Information
	WHERE Reward1 IS NOT NULL";

result["AVG_REWARD_1"] = reader["AvgReward1"];
```

- [x] **Step 7: 서버 계약 테스트가 통과하는지 확인**

Run:

```powershell
dotnet test YL.Tests/YL.Tests.csproj --filter "FullyQualifiedName~Lotto_payload_exposes_only_first_prize|FullyQualifiedName~Lotto_service_does_not_depend_on_secondary_prizes"
```

Expected: 두 테스트 모두 통과한다.

- [x] **Step 8: 단건 조회 바인딩 실패 테스트 추가 및 RED 확인**

`Lotto_single_turn_query_uses_safe_list_binding` 테스트에서 `BindToModel` 사용을 금지하고 `BindToList<LottoInformation>(reader).FirstOrDefault()` 사용을 요구한다. 기존 구현에서 `NumberBonus`가 `Numberbonus`로 변환되어 null 참조가 발생하는 것을 실제 `/GetLottoByTurn?turn=1232` 호출과 실패 테스트로 확인한다.

- [x] **Step 9: 단건 조회를 목록 Binder로 변경**

```csharp
lotto = Binder.BindToList<LottoInformation>(reader).FirstOrDefault()
	?? new LottoInformation();
```

기존 `reader.Read()`와 `Binder.BindToModel` 호출은 제거한다.

- [x] **Step 10: 단건 조회 회귀 테스트 GREEN 확인**

Run: `dotnet test YL.Tests/YL.Tests.csproj --filter "FullyQualifiedName~Lotto_single_turn_query_uses_safe_list_binding"`

Expected: 테스트가 통과하고 실제 단건 API가 1232회 데이터를 반환한다.

### Task 2: 화면과 다운로드에서 2등·3등 제거

**Files:**
- Modify: `YL.Tests/LottoDisplayContractTests.cs`
- Modify: `Views/Laboratory/Lotto.cshtml`
- Modify: `wwwroot/js/Lotto/lotto.js`
- Modify: `wwwroot/css/Lotto/lotto.css`

**Interfaces:**
- Consumes: `Reward1`만 포함하는 Lotto API 응답.
- Produces: 결과 표, CSV, 계산기, 과거 당첨 이력에 1등만 사용하는 화면.

- [x] **Step 1: UI 노출 경로를 검증하는 실패 테스트 추가**

`LottoDisplayContractTests`에 아래 테스트를 추가한다.

```csharp
[Fact]
public void Lotto_page_omits_second_and_third_prize_surfaces()
{
	string view = ReadRepositoryFile("Views", "Laboratory", "Lotto.cshtml");
	string script = ReadRepositoryFile("wwwroot", "js", "Lotto", "lotto.js");
	string style = ReadRepositoryFile("wwwroot", "css", "Lotto", "lotto.css");

	Assert.DoesNotContain("2등", view);
	Assert.DoesNotContain("3등", view);
	Assert.DoesNotContain("REWARD2", script);
	Assert.DoesNotContain("REWARD3", script);
	Assert.DoesNotContain("2등", script);
	Assert.DoesNotContain("3등", script);
	Assert.DoesNotContain("1~5등", script);
	Assert.DoesNotContain("rank-second", style);
	Assert.DoesNotContain("rank-third", style);
	Assert.DoesNotContain("rank-badge-second", style);
	Assert.DoesNotContain("rank-badge-third", style);
}
```

- [x] **Step 2: 테스트가 기존 표·CSV·계산기·이력 표시 때문에 실패하는지 확인**

Run:

```powershell
dotnet test YL.Tests/YL.Tests.csproj --filter "FullyQualifiedName~Lotto_page_omits_second_and_third_prize_surfaces"
```

Expected: `Lotto.cshtml`의 `2등` 또는 `lotto.js`의 `REWARD2` 때문에 실패한다.

- [x] **Step 3: 결과 표에서 2등·3등 열 제거**

`Views/Laboratory/Lotto.cshtml`의 표 머리글에는 1등 상금까지만 유지하고 계산기 선택지는 아래 세 개만 유지한다.

```html
<option value="6">6개 (1등)</option>
<option value="4">4개 (4등)</option>
<option value="3">3개 (5등)</option>
```

- [x] **Step 4: 목록 렌더링과 CSV를 10열 계약으로 변경**

빈 결과의 `colspan`을 `10`으로 바꾸고 행 템플릿에서 `REWARD2`, `REWARD3` 셀을 제거한다. CSV는 다음 헤더와 행 형식을 사용한다.

```javascript
csvContent += '회차,추첨일,번호1,번호2,번호3,번호4,번호5,번호6,보너스,1등상금\n';

const reward1 = lotto.REWARD1 ? `"${lotto.REWARD1}"` : '""';
const date = lotto.DATE ? `"${lotto.DATE}"` : '""';
csvContent += `${lotto.TURN},${date},${lotto.NUMBER1},${lotto.NUMBER2},${lotto.NUMBER3},${lotto.NUMBER4},${lotto.NUMBER5},${lotto.NUMBER6},${lotto.NUMBERBONUS},${reward1}\n`;
```

- [x] **Step 5: 계산기와 과거 이력의 2등·3등 클라이언트 분기 제거**

`getRankInfo`에는 1등 매핑만 유지하고 `calculateReward`의 `case '5b'`, `case '5'`를 제거한다. 1등, 4등, 5등 분기는 그대로 유지한다.

- [x] **Step 6: 사용하지 않는 2등·3등 이력 스타일 제거**

`wwwroot/css/Lotto/lotto.css`에서 `.match-found.rank-second`, `.match-found.rank-third`, `.rank-second .match-header`, `.rank-third .match-header`, `.rank-badge-second`, `.rank-badge-third` 블록을 제거한다. 공용 Bootstrap 의미의 `.btn-secondary` 스타일은 유지한다.

- [x] **Step 7: UI 계약 테스트가 통과하는지 확인**

Run:

```powershell
dotnet test YL.Tests/YL.Tests.csproj --filter "FullyQualifiedName~Lotto_page_omits_second_and_third_prize_surfaces"
```

Expected: 테스트가 통과한다.

### Task 3: 전체 검증과 인계

**Files:**
- Inspect: 모든 변경 파일과 기존 `Properties/PublishProfiles/ReleaseProfile.pubxml.user` 변경.

**Interfaces:**
- Consumes: 수정된 애플리케이션과 테스트 프로젝트.
- Produces: 빌드·테스트·화면 확인 결과와 전체 작업트리용 커밋 메시지.

- [x] **Step 1: 전체 테스트 실행**

Run:

```powershell
dotnet test YL.sln --configuration Debug
```

Expected: 기존 주문 계약 테스트와 신규 Lotto 계약 테스트가 모두 통과한다.

- [x] **Step 2: Debug 및 Release 빌드 실행**

Run:

```powershell
dotnet build YL.sln --configuration Debug
dotnet build YL.sln --configuration Release
```

Expected: 두 빌드 모두 오류 없이 종료한다.

- [x] **Step 3: 로컬 화면 확인**

애플리케이션을 로컬 개발 설정으로 실행하고 `/Laboratory/Lotto`를 연다. 결과 표 머리글이 1등에서 끝나고, 계산기 선택지가 1등·4등·5등만 포함하며, 브라우저 콘솔 오류가 없는지 확인한다. CSV 생성 코드는 10개 필드만 구성하는지 테스트와 코드로 재확인한다.

- [x] **Step 4: Git 상태 확인**

Run:

```powershell
git diff --check
git status --short --untracked-files=all
git diff --cached --name-only
git worktree list --porcelain
```

Expected: 새 변경은 Lotto 관련 소스·테스트·문서뿐이고, 스테이징은 비어 있으며, 기존 publish profile 변경은 보존되고, 추가 워크트리는 없다.

- [x] **Step 5: 커밋 메시지 준비**

커밋은 만들지 않고, Lotto의 2등·3등 UI/API 제거, 명시적 SQL 프로젝션, 회귀 테스트, 설계·계획 문서와 기존 publish profile 변경까지 포함하는 메시지를 사용자에게 제공한다.
