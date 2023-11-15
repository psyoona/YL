using System.Data.SqlClient;
using System.Data;
using YL.Models.Functions;

namespace YL.Models.Daos
{
	public class FortuneDao : BaseCommonDao
	{
		public FortuneDao()
		{
			this.ConnectionString = this.GetConnectionString();
		}

		public string GetFortuneMessage()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_GET_FORTUNE_MESSAGE");

			sqlDataReader.Read();
			string apiKey = sqlDataReader.GetString(0);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return apiKey;
		}
	}
}
