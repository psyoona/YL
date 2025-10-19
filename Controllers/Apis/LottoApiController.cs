using Microsoft.AspNetCore.Mvc;
using YL.Services;

namespace YL.Controllers.Apis
{
	[ApiController]
	public class LottoApiController : BaseApiController
	{
		[HttpGet]
		[Route("GetLottoList")]
		public JsonResult GetLottoList(int pageNumber = 1, int pageSize = 20, 
			int? turn = null, int? number1 = null, int? number2 = null, 
			int? number3 = null, int? number4 = null, int? number5 = null, 
			int? number6 = null, int? bonus = null)
		{
			LottoService lottoService = new LottoService();
			var lottoList = lottoService.GetLottoList(pageNumber, pageSize, turn, 
				number1, number2, number3, number4, number5, number6, bonus);
			var totalCount = lottoService.GetTotalCount(turn, 
				number1, number2, number3, number4, number5, number6, bonus);

			return this.Json(new 
			{ 
				DATA = lottoList,
				TOTAL_COUNT = totalCount,
				PAGE_NUMBER = pageNumber,
				PAGE_SIZE = pageSize
			}, this.JsonSerializerOptions);
		}

		[HttpGet]
		[Route("GetLottoByTurn")]
		public JsonResult GetLottoByTurn(int turn)
		{
			LottoService lottoService = new LottoService();
			var lotto = lottoService.GetLottoByTurn(turn);

			return this.Json(new { DATA = lotto }, this.JsonSerializerOptions);
		}

		[HttpGet]
		[Route("GetDashboardStats")]
		public JsonResult GetDashboardStats()
		{
			LottoService lottoService = new LottoService();
			var stats = lottoService.GetDashboardStats();

			return this.Json(new { DATA = stats }, this.JsonSerializerOptions);
		}

		[HttpGet]
		[Route("GetNumberFrequency")]
		public JsonResult GetNumberFrequency()
		{
			LottoService lottoService = new LottoService();
			var frequency = lottoService.GetNumberFrequency();

			return this.Json(new { DATA = frequency }, this.JsonSerializerOptions);
		}

		[HttpGet]
		[Route("GetRecentWinners")]
		public JsonResult GetRecentWinners(int count = 10)
		{
			LottoService lottoService = new LottoService();
			var recent = lottoService.GetRecentWinners(count);

			return this.Json(new { DATA = recent }, this.JsonSerializerOptions);
		}

		[HttpGet]
		[Route("GetPositionFrequency")]
		public JsonResult GetPositionFrequency()
		{
			LottoService lottoService = new LottoService();
			var positions = lottoService.GetPositionFrequency();

			return this.Json(new { DATA = positions }, this.JsonSerializerOptions);
		}

		[HttpPost]
		[Route("CheckNumberCombination")]
		public JsonResult CheckNumberCombination([FromBody] List<int> numbers)
		{
			LottoService lottoService = new LottoService();
			var result = lottoService.CheckNumberCombination(numbers);

			return this.Json(new { DATA = result }, this.JsonSerializerOptions);
		}
	}
}
