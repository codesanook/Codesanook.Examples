using HtmlAgilityPack;
using Microsoft.Playwright;
using static Microsoft.Playwright.Playwright;
using Flurl;
using Tmds.Utils;

namespace Codesanook.Examples.Playwright
{
    public class ProductSearcherWithNewProcess
    {
        public async Task<IReadOnlyCollection<IReadOnlyCollection<Product>>> SearchProductsAsync(IReadOnlyCollection<string> keywords)
        {
            // Run in each thread pool
            var htmlContent = await GetHtmlContentAsync(keywords);

            var keywordHtmlContentPairs = keywords.Zip(htmlContent, (k, c) => new { keyword = k, htmlContent = c });
            var parseHtmlTasks = keywordHtmlContentPairs.Select(p =>
           {
               return Task.Run(() =>
               {
                   var htmlDoc = new HtmlDocument();
                   htmlDoc.LoadHtml(p.htmlContent);
                   var links = htmlDoc.DocumentNode.SelectNodes("//mer-item-thumbnail/parent::a");
                   // For empty result, we don't get any //mer-item-thumbnail/parent::a back.
                   if (links == null)
                   {
                       return Array.Empty<Product>();
                   }

                   return ParseProductList(p.keyword, links);
               });
           });

            var result = await Task.WhenAll(parseHtmlTasks);
            return result;
        }

        private IReadOnlyCollection<Product> ParseProductList(string keyword, HtmlNodeCollection links)
        {
            return links.Select(l =>
            {
                var detailsUrl = Url.Combine("https://jp.mercari.com", l.Attributes["href"].Value);
                var item = l.SelectSingleNode("./mer-item-thumbnail");
                return new Product
                {
                    Name = keyword,
                    DetailsUrl = detailsUrl,
                    ShortDescription = item.Attributes["alt"].Value,
                    ImageUrl = item.Attributes["src"].Value,
                    Price = Convert.ToDecimal(item.Attributes["price"].Value)
                };

            }).ToList();
        }

        private async Task<IReadOnlyCollection<string>> GetHtmlContentAsync(IReadOnlyCollection<string> keys)
        {
            var task = Task.Run(() =>
            {
                string message = null; ;
                ExecFunction.Run(
                    async (args) =>
                    {
                        await DoSearch(args[0]);
                        return 0;
                    },
                    new[] { "Sony MZ-NE910" },
                    o =>
                    {
                        o.StartInfo.RedirectStandardOutput = true;
                        o.OnExit = p =>
                        {
                            message = p.StandardOutput.ReadToEnd();
                        };
                    }
                );

                return message;
            });

            return await Task.WhenAll(task);

        }

        public async Task DoSearch(string keyword)
        {
            using var playwright = await CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(new() { Headless = true });
            await using var context = await browser.NewContextAsync(
            new BrowserNewContextOptions()
            {
                Locale = "ja-JP",
                UserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36"
            });

            var page = await context.NewPageAsync();
            var encodedKeyword = Uri.EscapeDataString(keyword);
            var searchUrl = $"https://jp.mercari.com/search?keyword={encodedKeyword}&order=desc&sort=created_time&status=on_sale";
            await page.GotoAsync(searchUrl);

            // XPath selector https://playwright.dev/dotnet/docs/selectors#xpath-selectors
            // XPath selector https://playwright.dev/dotnet/docs/selectors#xpath-selectors
            // XPath selector https://playwright.dev/dotnet/docs/selectors#xpath-selectors
            // Selector starting with // or .. is assumed to be an xpath selector. 
            // We choose Search__ItemGridContainer because it is React component, we want to wait until React component render
            // "//div[contains(@class, 'Search__ItemGridContainer')]" does not work because it does not assure that mer-item-thumbnail is loaded.

            var option = new PageWaitForSelectorOptions() { Timeout = 10 * 1000 };
            var waitForFoundItemsTask = page.WaitForSelectorAsync(
                "//mer-item-thumbnail",
                option
            );

            var waitForNotFoundItemsTask = page.WaitForSelectorAsync(
                "//mer-empty-state",
                option
            );

            // Any one of waiting tasks is successful, get HTML content.
            await Task.WhenAny(waitForFoundItemsTask, waitForNotFoundItemsTask);
            var content = await page.ContentAsync();
            await page.CloseAsync();

            Console.WriteLine(content);
        }
    }
}
