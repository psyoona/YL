using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace YL.Services
{
	/// <summary>
	/// StockAutoTrader의 prices CLI 모드를 실행하여 실시간 현재가를 조회합니다.
	/// </summary>
	public static class CurrentPriceManager
	{
		private static readonly object _lock = new();
		private static bool _isRunning;

		public static bool IsRunning
		{
			get { lock (_lock) { return _isRunning; } }
		}

		/// <summary>감시 종목 실시간 현재가 조회</summary>
		public static async Task<JsonElement?> RunAsync()
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
					Arguments = "prices",
					WorkingDirectory = Path.GetDirectoryName(exePath) ?? string.Empty,
					UseShellExecute = false,
					RedirectStandardOutput = true,
					RedirectStandardError = true,
					CreateNoWindow = true,
					StandardOutputEncoding = Encoding.UTF8,
					StandardErrorEncoding = Encoding.UTF8
				};

				var output = new StringBuilder();

				using var process = new Process { StartInfo = startInfo };

				process.OutputDataReceived += (s, e) =>
				{
					if (e.Data != null) output.AppendLine(e.Data);
				};
				process.ErrorDataReceived += (s, e) => { };

				process.Start();
				process.BeginOutputReadLine();
				process.BeginErrorReadLine();

				// 최대 2분 대기 (종목 수 × API 호출)
				var completed = await Task.Run(() => process.WaitForExit(120_000));

				if (!completed)
				{
					try { process.Kill(entireProcessTree: true); } catch { }
					return JsonDocument.Parse(JsonSerializer.Serialize(new
					{
						success = false,
						message = "현재가 조회 시간 초과"
					})).RootElement;
				}

				var fullOutput = output.ToString();
				var marker = "##PRICES_RESULT##";
				var markerIndex = fullOutput.IndexOf(marker);

				if (markerIndex >= 0)
				{
					var jsonStr = fullOutput.Substring(markerIndex + marker.Length).Trim();
					return JsonDocument.Parse(jsonStr).RootElement;
				}

				return JsonDocument.Parse(JsonSerializer.Serialize(new
				{
					success = false,
					message = "현재가 조회 결과를 찾을 수 없습니다."
				})).RootElement;
			}
			catch (Exception ex)
			{
				return JsonDocument.Parse(JsonSerializer.Serialize(new
				{
					success = false,
					message = $"현재가 조회 오류: {ex.Message}"
				})).RootElement;
			}
			finally
			{
				lock (_lock)
				{
					_isRunning = false;
				}
			}
		}
	}
}
