using Microsoft.AspNetCore.HttpLogging;
using YL.Configs;
using YL.Handlers;

var builder = WebApplication.CreateBuilder(args);

ConfigManager.Initialize(builder.Configuration);

// 1) HttpLogging (��û/���� ��Ÿ)
builder.Services.AddHttpLogging(o =>
{
	o.LoggingFields =
		HttpLoggingFields.RequestPropertiesAndHeaders |
		HttpLoggingFields.ResponsePropertiesAndHeaders |
		HttpLoggingFields.Duration;

	// �ΰ����� ��ȣ: �ٵ� �α��� �⺻ ��Ȱ��
	o.RequestBodyLogLimit = 0;
	o.ResponseBodyLogLimit = 0;
});

// Add services to the container.
builder.Services.AddControllersWithViews();


var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseMiddleware<ErrorHandlerMiddleware>();

app.UseAuthorization();

app.MapControllerRoute(
	name: "default",
	pattern: "{controller=Laboratory}/{action=BaseConverter}/{id?}");

app.MapGet("/health", () => "OK");

app.Run();