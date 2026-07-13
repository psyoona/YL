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

		Assert.DoesNotContain("Reward2", service, StringComparison.OrdinalIgnoreCase);
		Assert.DoesNotContain("Reward3", service, StringComparison.OrdinalIgnoreCase);
		Assert.DoesNotContain("2등", service);
		Assert.DoesNotContain("3등", service);
	}

	[Fact]
	public void Lotto_single_turn_query_uses_safe_list_binding()
	{
		string service = ReadRepositoryFile("Services", "LottoService.cs");

		Assert.DoesNotContain("Binder.BindToModel(reader, lotto)", service);
		Assert.Contains("Binder.BindToList<LottoInformation>(reader).FirstOrDefault()", service);
	}

	[Fact]
	public void Lotto_page_omits_second_and_third_prize_surfaces()
	{
		string view = ReadRepositoryFile("Views", "Laboratory", "Lotto.cshtml");
		string script = ReadRepositoryFile("wwwroot", "js", "Lotto", "lotto.js");
		string style = ReadRepositoryFile("wwwroot", "css", "Lotto", "lotto.css");

		Assert.DoesNotContain("2등", view);
		Assert.DoesNotContain("3등", view);
		Assert.DoesNotContain("REWARD2", script, StringComparison.OrdinalIgnoreCase);
		Assert.DoesNotContain("REWARD3", script, StringComparison.OrdinalIgnoreCase);
		Assert.DoesNotContain("2등", script);
		Assert.DoesNotContain("3등", script);
		Assert.DoesNotContain("1~5등", script);
		Assert.DoesNotContain("rank-second", style);
		Assert.DoesNotContain("rank-third", style);
		Assert.DoesNotContain("rank-badge-second", style);
		Assert.DoesNotContain("rank-badge-third", style);
	}

	private static string ReadRepositoryFile(params string[] segments)
	{
		DirectoryInfo? directory = new DirectoryInfo(AppContext.BaseDirectory);
		while (directory != null && !File.Exists(Path.Combine(directory.FullName, "YL.sln")))
		{
			directory = directory.Parent;
		}

		Assert.NotNull(directory);
		return File.ReadAllText(Path.Combine(new[] { directory.FullName }.Concat(segments).ToArray()));
	}
}
