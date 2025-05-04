using YL.Configs;
using YL.Handlers;

var builder = WebApplication.CreateBuilder(args);

ConfigManager.Initialize(builder.Configuration);

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

app.Run();