using System.Data;
using System.Data.SqlClient;
using YL.Models.Functions;

namespace YL.Models.Daos
{
	public class ChatGptDao : BaseCommonDao
	{
		public ChatGptDao() { }

		public string GetChatGptApiKey()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_GET_CHAT_GPT_API_KEY");

			sqlDataReader.Read();
			string apiKey = sqlDataReader.GetString(0);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return apiKey;
		}
	}
}
