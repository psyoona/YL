using System.Data;
using Microsoft.Data.SqlClient;
using YL.Functions;
using YL.Models.Dtos.Webs;

namespace YL.Models.Daos
{
	public class AccountDao : BaseCommonDao
	{
		public AccountDao()
		{
			this.ConnectionString = this.GetConnectionString();
		}

		public void GetAccountHistory()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_GET_CHAT_GPT_API_KEY");

			sqlDataReader.Read();
			string apiKey = sqlDataReader.GetString(0);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

		}

		public AccountMainData GetAccountMainData()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_GET_ACCOUNT_MAIN_DATA");

			AccountMainData accountMainData = new AccountMainData();

			sqlDataReader.Read();
			Binder.BindToModel(sqlDataReader, accountMainData);

			sqlDataReader.NextResult();
			accountMainData.AccountHistoryList = Binder.BindToList<AccountHistory>(sqlDataReader);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return accountMainData;
		}
	}
}
