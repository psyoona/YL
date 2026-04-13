using System.Diagnostics;
using System.Text;

namespace YL.Services.Stock
{
	public static class StockAutoTraderManager
	{
		private static Process? _process;
		private static readonly object _lock = new();
		private static DateTime? _startedAt;
		private static readonly List<string> _recentLogs = new();
		private static readonly int MaxLogLines = 100;

		public static string ExePath { get; set; } = string.Empty;

		public static bool IsRunning
		{
			get
			{
				lock (_lock)
				{
					if (_process != null && !_process.HasExited)
					{
						return true;
					}

					// 외부에서 실행된 프로세스도 감지
					return FindExistingProcess() != null;
				}
			}
		}

		public static (bool success, string message) Start()
		{
			lock (_lock)
			{
				if (_process != null && !_process.HasExited)
				{
					return (false, "이미 실행 중입니다.");
				}

				// 외부에서 실행된 프로세스가 있는지 확인
				var existing = FindExistingProcess();
				if (existing != null)
				{
					_process = existing;
					_startedAt = existing.StartTime;
					return (false, "이미 실행 중인 프로세스가 감지되었습니다.");
				}

				if (string.IsNullOrEmpty(ExePath) || !File.Exists(ExePath))
				{
					return (false, $"실행 파일을 찾을 수 없습니다: {ExePath}");
				}

				try
				{
					var startInfo = new ProcessStartInfo
					{
						FileName = ExePath,
						WorkingDirectory = Path.GetDirectoryName(ExePath) ?? string.Empty,
						UseShellExecute = false,
						RedirectStandardOutput = true,
						RedirectStandardError = true,
						CreateNoWindow = true,
						StandardOutputEncoding = Encoding.UTF8,
						StandardErrorEncoding = Encoding.UTF8
					};

					_process = new Process { StartInfo = startInfo, EnableRaisingEvents = true };

					_process.OutputDataReceived += (s, e) =>
					{
						if (e.Data != null) AddLog(e.Data);
					};
					_process.ErrorDataReceived += (s, e) =>
					{
						if (e.Data != null) AddLog($"[ERROR] {e.Data}");
					};
					_process.Exited += (s, e) =>
					{
						AddLog("프로세스가 종료되었습니다.");
					};

					_process.Start();
					_process.BeginOutputReadLine();
					_process.BeginErrorReadLine();

					_startedAt = DateTime.Now;
					ClearLogs();
					AddLog("StockAutoTrader가 시작되었습니다.");

					return (true, "프로그램이 시작되었습니다.");
				}
				catch (Exception ex)
				{
					_process = null;
					return (false, $"시작 실패: {ex.Message}");
				}
			}
		}

		public static (bool success, string message) Stop()
		{
			lock (_lock)
			{
				var proc = _process;

				// 관리 중인 프로세스가 없으면 외부 프로세스 검색
				if (proc == null || proc.HasExited)
				{
					proc = FindExistingProcess();
				}

				if (proc == null || proc.HasExited)
				{
					_process = null;
					_startedAt = null;
					return (false, "실행 중인 프로세스가 없습니다.");
				}

				try
				{
					proc.Kill(entireProcessTree: true);
					proc.WaitForExit(5000);

					_process = null;
					_startedAt = null;
					AddLog("StockAutoTrader가 중지되었습니다.");

					return (true, "프로그램이 중지되었습니다.");
				}
				catch (Exception ex)
				{
					return (false, $"중지 실패: {ex.Message}");
				}
			}
		}

		public static object GetStatus()
		{
			lock (_lock)
			{
				bool running = false;
				int? pid = null;
				DateTime? startTime = _startedAt;
				string uptime = "";

				if (_process != null && !_process.HasExited)
				{
					running = true;
					pid = _process.Id;
				}
				else
				{
					var existing = FindExistingProcess();
					if (existing != null)
					{
						running = true;
						pid = existing.Id;
						try { startTime = existing.StartTime; } catch { }
						_process = existing;
						_startedAt = startTime;

						// 외부 프로세스 감지 시 로그가 없으면 안내 로그 추가
						lock (_recentLogs)
						{
							if (_recentLogs.Count == 0)
							{
								_recentLogs.Add($"[{DateTime.Now:HH:mm:ss}] 외부에서 실행된 프로세스가 감지되었습니다. (PID: {pid})");
								_recentLogs.Add($"[{DateTime.Now:HH:mm:ss}] 서버 재시작 등으로 이전 로그가 초기화되었습니다.");
								_recentLogs.Add($"[{DateTime.Now:HH:mm:ss}] 새로운 로그는 프로세스를 중지 후 재시작하면 수집됩니다.");
							}
						}
					}
				}

				if (running && startTime.HasValue)
				{
					var elapsed = DateTime.Now - startTime.Value;
					if (elapsed.TotalDays >= 1)
						uptime = $"{(int)elapsed.TotalDays}일 {elapsed.Hours}시간 {elapsed.Minutes}분";
					else if (elapsed.TotalHours >= 1)
						uptime = $"{elapsed.Hours}시간 {elapsed.Minutes}분";
					else
						uptime = $"{elapsed.Minutes}분 {elapsed.Seconds}초";
				}

				List<string> logs;
				lock (_recentLogs)
				{
					logs = new List<string>(_recentLogs);
				}

				return new
				{
					isRunning = running,
					pid,
					startedAt = startTime?.ToString("yyyy-MM-dd HH:mm:ss"),
					uptime,
					exePath = ExePath,
					logs
				};
			}
		}

		public static List<string> GetLogs()
		{
			lock (_recentLogs)
			{
				return new List<string>(_recentLogs);
			}
		}

		private static void AddLog(string message)
		{
			var line = $"[{DateTime.Now:HH:mm:ss}] {message}";
			lock (_recentLogs)
			{
				_recentLogs.Add(line);
				while (_recentLogs.Count > MaxLogLines)
				{
					_recentLogs.RemoveAt(0);
				}
			}
		}

		private static void ClearLogs()
		{
			lock (_recentLogs)
			{
				_recentLogs.Clear();
			}
		}

		private static Process? FindExistingProcess()
		{
			try
			{
				var processes = Process.GetProcessesByName("StockAutoTrader");
				return processes.FirstOrDefault(p => !p.HasExited);
			}
			catch
			{
				return null;
			}
		}
	}
}
