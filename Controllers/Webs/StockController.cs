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
				return this.RedirectToAction("Stocks");
			}

			return this.PartialView();
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
		[StockLoginRequired]
		public ActionResult Stocks()
		{
			this.Initialize();
			var session = StockCookieHelper.GetSession(Request);
			
			ViewBag.UserName = session.UserName;
			ViewBag.CurrentPage = "stocks";
			ViewBag.PageTitle = "종목 관리";

			return this.View();
		}

		[HttpGet]
		[StockLoginRequired]
		public ActionResult Holdings()
		{
			this.Initialize();
			var session = StockCookieHelper.GetSession(Request);

			ViewBag.UserName = session.UserName;
			ViewBag.CurrentPage = "holdings";
			ViewBag.PageTitle = "보유 종목";

			return this.View();
		}

		[HttpGet]
		[StockLoginRequired]
		public ActionResult Orders()
		{
			this.Initialize();
			var session = StockCookieHelper.GetSession(Request);

			ViewBag.UserName = session.UserName;
			ViewBag.CurrentPage = "orders";
			ViewBag.PageTitle = "주문 내역";

			return this.View();
		}

		[HttpGet]
		[StockLoginRequired]
		public ActionResult Logs()
		{
			this.Initialize();
			var session = StockCookieHelper.GetSession(Request);

			ViewBag.UserName = session.UserName;
			ViewBag.CurrentPage = "logs";
			ViewBag.PageTitle = "거래 로그";

			return this.View();
		}

		[HttpGet]
		[StockLoginRequired]
		public ActionResult Trader()
		{
			this.Initialize();
			var session = StockCookieHelper.GetSession(Request);

			ViewBag.UserName = session.UserName;
			ViewBag.CurrentPage = "trader";
			ViewBag.PageTitle = "자동매매 제어";

			return this.View();
		}

		[HttpGet]
		[StockLoginRequired]
		public ActionResult Backtest()
		{
			this.Initialize();
			var session = StockCookieHelper.GetSession(Request);

			ViewBag.UserName = session.UserName;
			ViewBag.CurrentPage = "backtest";
			ViewBag.PageTitle = "백테스트";

			return this.View();
		}

		[HttpGet]
		[StockLoginRequired]
		public ActionResult DailyPrices()
		{
			this.Initialize();
			var session = StockCookieHelper.GetSession(Request);

			ViewBag.UserName = session.UserName;
			ViewBag.CurrentPage = "dailyprices";
			ViewBag.PageTitle = "일봉 수집";

			return this.View();
		}

		[HttpGet]
		[StockLoginRequired]
		public ActionResult Glossary()
		{
			this.Initialize();
			var session = StockCookieHelper.GetSession(Request);

			ViewBag.UserName = session.UserName;
			ViewBag.CurrentPage = "glossary";
			ViewBag.PageTitle = "용어 사전";

			return this.View();
		}

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

		[HttpPost]
		[StockLoginRequired]
		public JsonResult GetHoldings()
		{
			var holdings = new StockService().GetHoldings();

			return this.Json(new { holdings });
		}

		[HttpPost]
		[StockLoginRequired]
		public JsonResult GetOrders()
		{
			var orders = new StockService().GetOrders();

			return this.Json(new { orders });
		}

		[HttpPost]
		[StockLoginRequired]
		public JsonResult GetTradeLogs()
		{
			var logs = new StockService().GetTradeLogs();

			return this.Json(new { logs });
		}

		[HttpPost]
		[StockLoginRequired]
		public JsonResult GetTraderStatus()
		{
			var status = StockAutoTraderManager.GetStatus();

			return this.Json(status);
		}

		[HttpPost]
		[StockLoginRequired]
		public JsonResult StartTrader()
		{
			var (success, message) = StockAutoTraderManager.Start();

			return this.Json(new { success, msg = message });
		}

		[HttpPost]
		[StockLoginRequired]
		public JsonResult StopTrader()
		{
			var (success, message) = StockAutoTraderManager.Stop();

			return this.Json(new { success, msg = message });
		}

		[HttpPost]
		[StockLoginRequired]
		public JsonResult GetTraderLogs()
		{
			var logs = StockAutoTraderManager.GetLogs();

			return this.Json(new { logs });
		}

		[HttpPost]
		[StockLoginRequired]
		public JsonResult GetBacktestStatus()
		{
			return this.Json(new { isRunning = BacktestManager.IsRunning });
		}

		[HttpPost]
		[StockLoginRequired]
		public async Task<JsonResult> RunBacktest(string startDate, string endDate, decimal capital)
		{
			if (BacktestManager.IsRunning)
			{
				return this.Json(new { success = false, msg = "백테스트가 이미 실행 중입니다." });
			}

			var result = await BacktestManager.RunAsync(startDate, endDate, capital);

			if (result == null)
			{
				return this.Json(new { success = false, msg = "백테스트 실행에 실패했습니다." });
			}

			return this.Json(result);
		}

		[HttpPost]
		[StockLoginRequired]
		public JsonResult GetDailyPriceStatus()
		{
			return this.Json(new { isRunning = DailyPriceCollectManager.IsRunning });
		}

		[HttpPost]
		[StockLoginRequired]
		public async Task<JsonResult> CollectDailyPrices(string startDate, string endDate)
		{
			if (DailyPriceCollectManager.IsRunning)
			{
				return this.Json(new { success = false, msg = "일봉 수집이 이미 실행 중입니다." });
			}

			var result = await DailyPriceCollectManager.RunAsync(startDate, endDate);

			if (result == null)
			{
				return this.Json(new { success = false, msg = "일봉 수집 실행에 실패했습니다." });
			}

			return this.Json(result);
		}
	}
}
