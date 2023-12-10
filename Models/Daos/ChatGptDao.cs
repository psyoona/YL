using System.Data;
using System.Data.SqlClient;
using YL.Models.Functions;

namespace YL.Models.Daos
{
	public class ChatGptDao : BaseCommonDao
	{
		public ChatGptDao() 
		{
			this.ConnectionString = this.GetConnectionString();
		}

		public string GetChatGptApiKey(string usingKey)
		{
			List<SqlParameter> sqlParameters = new List<SqlParameter>
			{
				new SqlParameter("USING_KEY", SqlDbType.NVarChar){ Value = usingKey }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_GET_CHAT_GPT_API_KEY",
				sqlParameters.ToArray());

			sqlDataReader.Read();
			string apiKey = sqlDataReader.GetString(0);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return apiKey;
		}

		public void InsertChatGptUsingLog(string usingType, string message, string response)
		{
			List<SqlParameter> sqlParameters = new List<SqlParameter>
			{
				new SqlParameter("USING_TYPE", SqlDbType.NVarChar){ Value = usingType },
				new SqlParameter("MESSAGE", SqlDbType.NVarChar){ Value = message },
				new SqlParameter("RESPONSE", SqlDbType.NVarChar){ Value = response }
			};

			SqlHelper.ExecuteNonQuery(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_INSERT_CHAT_GPT_USING_LOG",
				sqlParameters.ToArray());
		}
	}
}
