namespace YL.Configs
{
	public class ConfigManager
	{
		public static AppSettings Settings { get; set; }

		public static bool IsDebugMode { get; set; }

		public static void Initialize(IConfiguration configuration)
		{
			var connectionString = configuration.GetConnectionString("ConnectionString") ?? string.Empty;
			var stockConnectionString = configuration.GetConnectionString("StockConnectionString") ?? string.Empty;
			var ipList = configuration.GetSection("Whitelist:IPList").Get<List<string>>() ?? new();
			var serviceBasePath = configuration.GetValue<string>("ServiceBasePath") ?? string.Empty;
			var albumEncryptionKey = configuration.GetValue<string>("AlbumEncryptionKey") ?? string.Empty;
			var stockEncryptionKey = configuration.GetValue<string>("StockEncryptionKey") ?? string.Empty;
			var stockAutoTraderExePath = configuration.GetValue<string>("StockAutoTraderExePath") ?? string.Empty;

			Settings = new AppSettings
			{
				ConnectionString = connectionString,
				StockConnectionString = stockConnectionString,
				IPWhitelist = ipList,
				ServiceBasePath = serviceBasePath,
				AlbumEncryptionKey = albumEncryptionKey,
				StockEncryptionKey = stockEncryptionKey,
				StockAutoTraderExePath = stockAutoTraderExePath
			};
		}
	}
}