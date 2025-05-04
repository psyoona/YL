using YL.Configs;
using YL.Contants;

namespace YL.Models.Daos
{
	public class BaseCommonDao
	{
		protected string ConnectionString { get; set; }

		protected string GetConnectionString()
		{
			return ConfigManager.Settings.ConnectionString;
		}
	}
}
