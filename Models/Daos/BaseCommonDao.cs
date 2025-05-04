using YL.Contants;
using YL.Functions;

namespace YL.Models.Daos
{
    public class BaseCommonDao
	{
		protected string ConnectionString { get; set; }

		protected string GetConnectionString()
		{
			return CustomConfig.AppSettings.GetConnectionString(ConstKey.CONNECTION_STRING);
		}
	}
}
