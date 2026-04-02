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

// Session 설정 (앨범 로그인 용)
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
	options.IdleTimeout = TimeSpan.FromHours(24);
	options.Cookie.HttpOnly = true;
	options.Cookie.IsEssential = true;
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseMiddleware<ErrorHandlerMiddleware>();

app.UseSession();
app.UseAuthorization();

app.MapControllerRoute(
	name: "default",
	pattern: "{controller=Laboratory}/{action=BaseConverter}/{id?}");

app.MapGet("/health", () => "OK");

app.Run();