using System.Data;
using Microsoft.Data.SqlClient;
using YL.Functions;

namespace YL.Models.Daos
{
	public class ErrorLogDao : BaseCommonDao
	{
		public ErrorLogDao()
		{
			this.ConnectionString = this.GetConnectionString();
		}

		public void InsertErrorLog(int? errorCode, string message, string stackTrace, string requestMethod, string requestPath, string requestBody, string userIp)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ERROR_CODE", SqlDbType.Int) { Value = errorCode.HasValue ? errorCode.Value : DBNull.Value },
				new SqlParameter("@MESSAGE", SqlDbType.NVarChar) { Value = message ?? (object)DBNull.Value },
				new SqlParameter("@STACK_TRACE", SqlDbType.NVarChar) { Value = stackTrace ?? (object)DBNull.Value },
				new SqlParameter("@REQUEST_METHOD", SqlDbType.NVarChar) { Value = requestMethod },
				new SqlParameter("@REQUEST_PATH", SqlDbType.NVarChar) { Value = requestPath },
				new SqlParameter("@REQUEST_BODY", SqlDbType.NVarChar) { Value = requestBody ?? (object)DBNull.Value },
				new SqlParameter("@USER_IP", SqlDbType.NVarChar) { Value = userIp ?? (object)DBNull.Value }
			};

			SqlHelper.ExecuteNonQuery(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_INSERT_ERROR_LOG",
				parameters);
		}
	}
}
