using System.Data;
using Microsoft.Data.SqlClient;
using YL.Functions;
using YL.Models.Dtos.Webs;

namespace YL.Models.Daos
{
	public class StockDao : BaseCommonDao
	{
		public StockDao()
		{
			this.ConnectionString = this.GetStockConnectionString();
		}

		// ============================================
		// 로그인
		// ============================================

		public StockUser Login(string loginId, string passwordHash)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@LOGIN_ID", SqlDbType.NVarChar) { Value = loginId },
				new SqlParameter("@PASSWORD_HASH", SqlDbType.NVarChar) { Value = passwordHash }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_STOCK_USER_LOGIN",
				parameters);

			StockUser stockUser = new StockUser();

			if (sqlDataReader.Read())
			{
				stockUser.IsValid = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("IS_VALID"));
				stockUser.UserName = sqlDataReader.GetString(sqlDataReader.GetOrdinal("USER_NAME"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return stockUser;
		}

		// ============================================
		// 종목 관리
		// ============================================

		public List<StockInfo> GetStocks()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_STOCK_GET_STOCKS");

			List<StockInfo> stocks = Binder.BindToList<StockInfo>(sqlDataReader);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return stocks;
		}

		public bool CreateStock(string stockCode, string stockName, string marketType)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@STOCK_CODE", SqlDbType.NVarChar) { Value = stockCode },
				new SqlParameter("@STOCK_NAME", SqlDbType.NVarChar) { Value = stockName },
				new SqlParameter("@MARKET_TYPE", SqlDbType.NVarChar) { Value = marketType }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_STOCK_CREATE_STOCK",
				parameters);

			bool success = false;

			if (sqlDataReader.Read())
			{
				success = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("SUCCESS"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return success;
		}

		public bool UpdateStock(string stockCode, string stockName, string marketType, bool isActive, bool isWatchList)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@STOCK_CODE", SqlDbType.NVarChar) { Value = stockCode },
				new SqlParameter("@STOCK_NAME", SqlDbType.NVarChar) { Value = stockName },
				new SqlParameter("@MARKET_TYPE", SqlDbType.NVarChar) { Value = marketType },
				new SqlParameter("@IS_ACTIVE", SqlDbType.Bit) { Value = isActive },
				new SqlParameter("@IS_WATCH_LIST", SqlDbType.Bit) { Value = isWatchList }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_STOCK_UPDATE_STOCK",
				parameters);

			bool success = false;

			if (sqlDataReader.Read())
			{
				success = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("SUCCESS"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return success;
		}

		public bool DeleteStock(string stockCode)
		{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@STOCK_CODE", SqlDbType.NVarChar) { Value = stockCode }
			};

			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_STOCK_DELETE_STOCK",
				parameters);

			bool success = false;

			if (sqlDataReader.Read())
			{
				success = sqlDataReader.GetBoolean(sqlDataReader.GetOrdinal("SUCCESS"));
			}

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return success;
		}

		// ============================================
		// 보유 종목
		// ============================================

		public List<HoldingInfo> GetHoldings()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_STOCK_GET_HOLDINGS");

			List<HoldingInfo> holdings = Binder.BindToList<HoldingInfo>(sqlDataReader);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return holdings;
		}

		// ============================================
		// 주문 내역
		// ============================================

		public List<OrderInfo> GetOrders()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_STOCK_GET_ORDERS");

			List<OrderInfo> orders = Binder.BindToList<OrderInfo>(sqlDataReader);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return orders;
		}

		// ============================================
		// 거래 로그
		// ============================================

		public List<TradeLogInfo> GetTradeLogs()
		{
			SqlDataReader sqlDataReader = SqlHelper.ExecuteReader(
				this.ConnectionString,
				CommandType.StoredProcedure,
				"SP_STOCK_GET_TRADE_LOGS");

			List<TradeLogInfo> logs = Binder.BindToList<TradeLogInfo>(sqlDataReader);

			SqlHelper.CloseSqlDataReader(sqlDataReader);

			return logs;
		}
	}
}
