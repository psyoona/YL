namespace YL.Configs
{
	public class AppSettings
	{
		public string ConnectionString { get; set; } = string.Empty;

		public List<string> IPWhitelist { get; set; } = new();
	}
}
