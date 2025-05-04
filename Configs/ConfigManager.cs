namespace YL.Configs
{
	public class ConfigManager
	{
		public static AppSettings Settings { get; set; }

		public static bool IsDebugMode { get; set; }

		public static void Initialize(IConfiguration configuration)
		{
			var connectionString = configuration.GetConnectionString("ConnectionString") ?? string.Empty;
			var ipList = configuration.GetSection("Whitelist:IPList").Get<List<string>>() ?? new();

			Settings = new AppSettings
			{
				ConnectionString = connectionString,
				IPWhitelist = ipList
			};
		}
	}
}