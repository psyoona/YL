using YL.Helpers;
using YL.Models.Daos;
using YL.Models.Dtos.Commons;
using YL.Models.Dtos.Webs;

namespace YL.Services
{
	public class StockService
	{
		public (bool IsValid, string UserName, StockSession? Session) Authenticate(string loginId, string password)
		{
			string passwordHash = new SecurityHelper().Sha512Hash(password);
			var user = new StockDao().Login(loginId, passwordHash);

			if (!user.IsValid)
			{
				return (false, string.Empty, null);
			}

			var session = new StockSession
			{
				LoginId = loginId,
				UserName = user.UserName
			};

			return (true, user.UserName, session);
		}

		// ============================================
		// 종목 관리
		// ============================================

		public List<StockInfo> GetStocks()
		{
			return new StockDao().GetStocks();
		}

		public void CreateStock(string stockCode, string stockName, string marketType)
		{
			if (string.IsNullOrWhiteSpace(stockCode))
			{
				throw new CustomException(StockErrors.StockCodeRequired);
			}

			if (string.IsNullOrWhiteSpace(stockName))
			{
				throw new CustomException(StockErrors.StockNameRequired);
			}

			bool success = new StockDao().CreateStock(stockCode.Trim(), stockName.Trim(), marketType ?? "KOSPI");

			if (!success)
			{
				throw new CustomException(StockErrors.StockCreateFailed);
			}
		}

		public void UpdateStock(string stockCode, string stockName, string marketType, bool isActive, bool isWatchList)
		{
			if (string.IsNullOrWhiteSpace(stockCode))
			{
				throw new CustomException(StockErrors.StockCodeRequired);
			}

			bool success = new StockDao().UpdateStock(stockCode, stockName, marketType, isActive, isWatchList);

			if (!success)
			{
				throw new CustomException(StockErrors.StockUpdateFailed);
			}
		}

		public void DeleteStock(string stockCode)
		{
			if (string.IsNullOrWhiteSpace(stockCode))
			{
				throw new CustomException(StockErrors.StockCodeRequired);
			}

			bool success = new StockDao().DeleteStock(stockCode);

			if (!success)
			{
				throw new CustomException(StockErrors.StockDeleteFailed);
			}
		}

		// ============================================
		// 보유 종목
		// ============================================

		public List<HoldingInfo> GetHoldings()
		{
			return new StockDao().GetHoldings();
		}

		// ============================================
		// 주문 내역
		// ============================================

		public List<OrderInfo> GetOrders()
		{
			return new StockDao().GetOrders();
		}

		// ============================================
		// 거래 로그
		// ============================================

		public List<TradeLogInfo> GetTradeLogs()
		{
			return new StockDao().GetTradeLogs();
		}
	}
}
