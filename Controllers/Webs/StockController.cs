using Microsoft.AspNetCore.Mvc;
using YL.Filters;
using YL.Helpers;
using YL.Services;

namespace YL.Controllers.Webs
{
	public class StockController : BaseController
	{
		[HttpGet]
		public ActionResult Login()
		{
			this.Initialize();

			if (StockCookieHelper.GetSession(Request) != null)
			{
				return this.RedirectToAction("Index");
			}

			return this.View();
		}

		[HttpPost]
		public JsonResult Authenticate(string loginId, string password)
		{
			var result = new StockService().Authenticate(loginId, password);

			if (result.Session != null)
			{
				StockCookieHelper.SetSession(Response, result.Session);
			}

			return this.Json(new { success = result.IsValid, userName = result.UserName });
		}

		[HttpGet]
		public ActionResult Logout()
		{
			StockCookieHelper.ClearSession(Response);
			return this.RedirectToAction("Login");
		}

		[HttpGet]
		public ActionResult Index()
		{
			this.Initialize();

			var session = StockCookieHelper.GetSession(Request);

			if (session == null)
			{
				return this.RedirectToAction("Login");
			}

			ViewBag.UserName = session.UserName;

			return this.View();
		}

		// ============================================
		// 종목 관리 API
		// ============================================

		[HttpPost]
		[StockLoginRequired]
		public JsonResult GetStocks()
		{
			var stocks = new StockService().GetStocks();

			return this.Json(new { stocks });
		}

		[HttpPost]
		[StockLoginRequired]
		public JsonResult CreateStock(string stockCode, string stockName, string marketType)
		{
			new StockService().CreateStock(stockCode, stockName, marketType);

			return this.Json(new { success = true });
		}

		[HttpPost]
		[StockLoginRequired]
		public JsonResult UpdateStock(string stockCode, string stockName, string marketType, bool isActive, bool isWatchList)
		{
			new StockService().UpdateStock(stockCode, stockName, marketType, isActive, isWatchList);

			return this.Json(new { success = true });
		}

		[HttpPost]
		[StockLoginRequired]
		public JsonResult DeleteStock(string stockCode)
		{
			new StockService().DeleteStock(stockCode);

			return this.Json(new { success = true });
		}

		// ============================================
		// 보유 종목 API
		// ============================================

		[HttpPost]
		[StockLoginRequired]
		public JsonResult GetHoldings()
		{
			var holdings = new StockService().GetHoldings();

			return this.Json(new { holdings });
		}

		// ============================================
		// 주문 내역 API
		// ============================================

		[HttpPost]
		[StockLoginRequired]
		public JsonResult GetOrders()
		{
			var orders = new StockService().GetOrders();

			return this.Json(new { orders });
		}

		// ============================================
		// 거래 로그 API
		// ============================================

		[HttpPost]
		[StockLoginRequired]
		public JsonResult GetTradeLogs()
		{
			var logs = new StockService().GetTradeLogs();

			return this.Json(new { logs });
		}
	}
}
