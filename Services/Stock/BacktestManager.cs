using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace YL.Services.Stock
{
	/// <summary>
	/// StockAutoTrader의 백테스트 CLI 모드를 실행하고 결과를 파싱합니다.
	/// </summary>
	public static class BacktestManager
	{
		private static Process? _process;
		private static readonly object _lock = new();
		private static bool _isRunning;

		public static bool IsRunning
		{
			get { lock (_lock) { return _isRunning; } }
		}

		/// <summary>백테스트 실행 (비동기)</summary>
		public static async Task<JsonElement?> RunAsync(string startDate, string endDate, decimal capital)
		{
			lock (_lock)
			{
				if (_isRunning)
					return null;
				_isRunning = true;
			}

			try
			{
				var exePath = StockAutoTraderManager.ExePath;
				if (string.IsNullOrEmpty(exePath) || !File.Exists(exePath))
				{
					return JsonDocument.Parse(JsonSerializer.Serialize(new
					{
						success = false,
						message = $"실행 파일을 찾을 수 없습니다: {exePath}"
					})).RootElement;
				}

				var startInfo = new ProcessStartInfo
				{
					FileName = exePath,
					Arguments = $"backtest --start {startDate} --end {endDate} --capital {capital}",
					WorkingDirectory = Path.GetDirectoryName(exePath) ?? string.Empty,
					UseShellExecute = false,
					RedirectStandardOutput = true,
					RedirectStandardError = true,
					CreateNoWindow = true,
					StandardOutputEncoding = Encoding.UTF8,
					StandardErrorEncoding = Encoding.UTF8
				};

				var output = new StringBuilder();
				var errors = new StringBuilder();

				using var process = new Process { StartInfo = startInfo };
				_process = process;

				process.OutputDataReceived += (s, e) =>
				{
					if (e.Data != null) output.AppendLine(e.Data);
				};
				process.ErrorDataReceived += (s, e) =>
				{
					if (e.Data != null) errors.AppendLine(e.Data);
				};

				process.Start();
				process.BeginOutputReadLine();
				process.BeginErrorReadLine();

				// 최대 5분 대기
				var completed = await Task.Run(() => process.WaitForExit(300_000));

				if (!completed)
				{
					try { process.Kill(entireProcessTree: true); } catch { }
					return JsonDocument.Parse(JsonSerializer.Serialize(new
					{
						success = false,
						message = "백테스트 시간 초과 (5분)"
					})).RootElement;
				}

				// ##BACKTEST_RESULT## 마커로 JSON 결과 추출
				var fullOutput = output.ToString();
				var marker = "##BACKTEST_RESULT##";
				var markerIndex = fullOutput.IndexOf(marker);

				if (markerIndex >= 0)
				{
					var jsonStr = fullOutput.Substring(markerIndex + marker.Length).Trim();
					return JsonDocument.Parse(jsonStr).RootElement;
				}

				return JsonDocument.Parse(JsonSerializer.Serialize(new
				{
					success = false,
					message = "백테스트 결과를 찾을 수 없습니다.",
					output = fullOutput.Length > 2000 ? fullOutput[..2000] : fullOutput,
					errors = errors.ToString()
				})).RootElement;
			}
			catch (Exception ex)
			{
				return JsonDocument.Parse(JsonSerializer.Serialize(new
				{
					success = false,
					message = $"백테스트 실행 오류: {ex.Message}"
				})).RootElement;
			}
			finally
			{
				lock (_lock)
				{
					_isRunning = false;
					_process = null;
				}
			}
		}
	}
}
