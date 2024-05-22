const { chromium } = require("playwright"); //used playwright for data scraping
const ExcelJS = require("exceljs"); // Library for transferring data into excel sheet

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
 
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to LinkedIn login page
  await page.goto("https://www.linkedin.com/login");

  await page.setViewportSize({ width: 1280, height: 1024 });

  // Wait for the login form to appear
  await page.waitForSelector('input[name="session_key"]');

  // This is how we Fill in login credentials
  await page.fill('input[name="session_key"]', "aman.tke1902008@tmu.ac.in");
  await page.fill('input[name="session_password"]', "5522@AManchauhan2");

  // Clicking on the login button
  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000); // Increase timeout to 60 seconds

  // Waiting for login to complete

  // Confirm login success
  console.log("Logged in successfully!");

  const searchInput = await page.locator(
    "input.search-global-typeahead__input"
  );

  // Typing "education" into the search input
  await searchInput.fill("logistics");

  // Press Enter to perform the search
  await searchInput.press("Enter");

  // Wait for the search results page to load
  await page.waitForTimeout(1000);

  // Clicks a <button> that has either a "Log in" or "Sign in" text.
  const button = await page.getByRole("button", { name: "Companies" });

  // Click on the button
  await button.click();

  // Wait for the search results page to load
  await page.waitForTimeout(1000);

  const locationbutton = await page.getByLabel("Locations filter. Clicking");

  await locationbutton.click();

  await page.waitForTimeout(1000);

  const locationfilter = await page.getByPlaceholder("Add a location");
  await page.waitForTimeout(1000);

  await locationfilter.fill("Sharjah Emirate, United Arab Emirates");
  await page.waitForTimeout(1000);

  await page.getByText("Sharjah Emirate, United Arab Emirates", { exact: true }).click();

  await page.waitForTimeout(1000);

  await locationfilter.fill("Ajman Emirate, United Arab");
  await page.waitForTimeout(1000);

  await page.getByText('Ajman Emirate, United Arab').click();
  await page.waitForTimeout(1000);

  const showResultsButton = await page.getByRole("button", {
    name: "Apply current filter to show",
  });

  await showResultsButton.click();
  await page.waitForTimeout(1000);

  await page.waitForTimeout(1000);


  const industryButton = await page.getByLabel("Industry filter. Clicking");
  await industryButton.click();

  await page.waitForTimeout(1000);

  const industryfilter = await page.getByPlaceholder("Add an industry");
  await page.waitForTimeout(1000);

  await industryfilter.fill("Transportation, Logistics, Supply Chain and Storage");

  await page.waitForTimeout(1000);

  await page
    .locator("label")
    .filter({ hasText: "Transportation, Logistics, Supply Chain and Storage" })
    .click();

  await page.waitForTimeout(2000);


  // This is how we add wait for timeout timely to avoid any suspicion of automated requests by linkedin

  const showresultindustry = await page.getByRole("button", {
    name: "Apply current filter to show",
  });

  showresultindustry.click();

  //here we wait for the company size element to become visible

  await page.waitForTimeout(2000);

  // creating the logic for entering data into an excel sheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Company Details");

  // Define headers for the worksheet
  worksheet.addRow([
    "Company Name",
    "Website",
    "Foundation Year/Industry",
    "Company Size",
    "Headquarters",
    "industryText",
  ]);

  //  To  make a count variable for how many copanies data we want to extract
  let count = 0;
  let companyDetails = [];
  let counterforindividual = 0;

  try {
    while (count < 112) {
      const searchResultsContainer = await page.waitForSelector(
        ".reusable-search__entity-result-list"
      );

      if (searchResultsContainer) {
        const resultElements = await searchResultsContainer.$$(
          "li.reusable-search__result-container"
        );

        // Loop through the resultElements
        for (const elementHandle of resultElements) {
          let PhoneNumberOrIndustry = null;
          let CompanySize = null;
          let headquarters = null;
          let industryText = null;
          let titleText = null; 

          let companyPage = await context.newPage();

          try {
            // Find the anchor element within each li
            const anchorElement = await elementHandle.$(
              "span.entity-result__title-text a.app-aware-link"
            );
            if (anchorElement) {
              // Retrieve the href attribute
              const href = await anchorElement.getAttribute("href");
              console.log("Link:", href);

              // Open a new page within the same context for each company
              console.log(href);
              // Navigate to the company page
              await companyPage.goto(href + "about/");

              // Wait for the new page to load
              // await companyPage.waitForTimeout(1000);

              const companyTitle = await companyPage.$("h1");
              if (companyTitle) {
                // Get the inner text of the element
                 titleText = await companyTitle.innerText();
                console.log("Company title:", titleText);
              } else {
                console.error("Company title element not found.");
              }

              // await companyPage.waitForTimeout(5000);
              // Fields which are required
              await companyPage.waitForSelector(
                ".org-page-details-module__card-spacing "
              );
              const companyDetai = await companyPage.$(
                ".org-page-details-module__card-spacing "
              );
              const dl = await companyDetai.$("dl");
              const allDl = await dl.$$("dd");

              const spanWebsite = await allDl[0].$("span");
              const websitelink = await (
                await spanWebsite.getProperty("textContent")
              ).jsonValue();
              await page.waitForTimeout(1000);

              console.log("this is websitelink" + websitelink);

              //Second Field Which Is Important (PhoneNumberOrIndustry)
              const spanPhoneNumberOrIndustry = await allDl[1];
              if (spanPhoneNumberOrIndustry) {
                // If the <span> element exists, proceed with extracting the text content
                PhoneNumberOrIndustry = await (
                  await spanPhoneNumberOrIndustry.getProperty("textContent")
                ).jsonValue();
                console.log("y phone " + PhoneNumberOrIndustry);
              } else {
                console.error("No Phone Number field entry was there");
              }

              //Third Field Which Is Important (CompanySize)
              const CompanySizeDetail = await allDl[2];
              if (CompanySizeDetail) {
                CompanySize = await (
                  await CompanySizeDetail.getProperty("textContent")
                ).jsonValue();
                console.log("y company size  " + CompanySize);
              } else {
                console.error("No Company Size field entry was there");
              }

              //Fourth Field Which Is Important (headquartersDetail)

              // industry1(websitelink) related
              const ddElementweblink = await companyPage.$('dt:has-text("Website") + dd');
              if (ddElementweblink) {
                  const anchorTag = await ddElementweblink.$('a'); // Find the <a> tag inside <dd>
                  if (anchorTag) {
                      var websiteLinkfinal = await anchorTag.getAttribute('href'); // Extract the href attribute
                      console.log('Website Link:', websiteLinkfinal);
                  } else {
                      console.error('Anchor tag not found within dd element.');
                  }
              } else {
                  console.error('dd element not found for Website.');
              }

              // industry1(websitelink) related
              
              // industry related
              const dtElementindustry = await companyPage.getByText(
                "Industry",
                {
                  exact: true,
                }
              );
              if (dtElementindustry) {
                //to Get the next sibling, which should be the corresponding dd element
                const ddElementindustry = await companyPage.$(
                  'dt:has-text("Industry") + dd'
                );

                if (ddElementindustry) {
                  // Extract the text content of the dd element
                  industryText = await ddElementindustry.innerText();
                  console.log("industrytext:", industryText);
                } else {
                  console.error("No subsequent dd element found for industry.");
                }
              } else {
                console.error("No dt element found containing industry.");
              }

              // industry related

              // Find the dt element containing "Headquarters"
              const dtElement = await companyPage.getByText("Headquarters", {
                exact: true,
              });

              if (dtElement) {
                // Get the next sibling, which should be the corresponding dd element
                const ddElement = await companyPage.$(
                  'dt:has-text("Headquarters") + dd'
                );

                if (ddElement) {
                  // Extract the text content of the dd element
                  var headquartersText = await ddElement.innerText();
                  console.log("Headquarters:", headquartersText);
                } else {
                  console.error(
                    "No subsequent dd element found for Headquarters."
                  );
                }
              } else {
                console.error("No dt element found containing Headquarters.");
              }

              const ddElements = await companyPage.$$(
                ".org-page-details-module__card-spacing dd"
              );

              // Loop through ddElements to extract each type of information
              for (const ddElement of ddElements) {
                const text = await ddElement.innerText();

                if (/^\d[\d\+,]+$/.test(text)) {
                  PhoneNumberOrIndustry = text.trim();
                } else if (text.toLowerCase().includes("employees")) {
                  CompanySize = text.trim();
                }
              }

              const cleanUpString = (str) => {
                // Remove leading and trailing whitespace
                str = str.trim();
                // Remove extra whitespace and newlines
                str = str.replace(/\s+/g, " ");
                // Remove additional information enclosed in parentheses
                str = str.replace(/\(.*?\)/g, "");
                return str;
              };

              companyDetails.forEach((company) => {
                company.websiteLinks = cleanUpString(company.websiteLinks);
              });

              //Now storing all about fields in an object and then returning

              const finalDetails = {
                companyname: titleText,
                // websiteLinks: websitelink,
                websiteLinks: websiteLinkfinal,
                FoundationYear: PhoneNumberOrIndustry,
                CompanySize: CompanySize,
                headquarters: headquartersText,
                industryText: industryText,
              };
              console.log("final Details", finalDetails);
              counterforindividual++;
              console.log(
                "So far ",
                counterforindividual,
                " companies data extracted"
              );

              companyDetails.push(finalDetails);
              count++;
            } else {
              console.error(
                "Anchor element not found within result container."
              );
            }
          } catch (error) {
            console.error(
              "Error occurred while processing result:",
              error.message
            );
          }

          await companyPage.close();
          if (count >= 112) break;
        }

    

        console.log("Cleaned Company details:", companyDetails);
      } else {
        console.error("Search results container not found.");
      }

      if (count >= 112) break;

      await page.waitForTimeout(3000);

      const nextPageButton = await page.getByLabel("Next");

      if (nextPageButton) {
        await nextPageButton.click();

        // await page.waitForTimeout(2000); // Adjust timeout as needed
      } else {
        console.error("Next page button not found.");
        break;
      }
    } //while end
  } catch (error) {
    console.error("Error occurred:", error.message);
    if (error.name === "TimeoutError") {
      console.error("Timeout error, saving data to Excel sheet...");
    }
  } finally {
    companyDetails.forEach((company) => {
      worksheet.addRow([
        company.companyname,
        company.websiteLinks,
        company.FoundationYear,
        company.CompanySize,
        company.headquarters,
        company.industryText,
      ]);
    });

    await workbook.xlsx.writeFile("company_details2.xlsx");
    await browser.close();
  }
})();
