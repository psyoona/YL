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
	}
}
