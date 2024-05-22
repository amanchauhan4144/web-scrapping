const { chromium } = require("playwright");   //used playwright for data scraping 
const ExcelJS = require("exceljs");  // Library for transferring data into excel sheet 

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  // with sync_playwright() as play_wright:  Apply the stealth settings
  // stealth_sync(page)
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to LinkedIn login page
  await page.goto("https://www.linkedin.com/login");

  await page.setViewportSize({width:1280, height: 1024});

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
  await searchInput.fill("tourism");

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

  const locationfilter = await page.getByPlaceholder('Add a location')
  await page.waitForTimeout(1000);


  await locationfilter.fill('Dubai, United Arab Emirates');
  await page.waitForTimeout(1000);



  await page.getByText('Dubai, United Arab Emirates', { exact: true }).click();

  await page.waitForTimeout(1000);

  const showResultsButton = await page.getByRole("button", {
    name: "Apply current filter to show",
  });

  await showResultsButton.click();
  await page.waitForTimeout(1000);


  ////hii this is 
  await page.waitForTimeout(1000);

  const companysizeButton = await page.getByLabel(
    "Company size filter. Clicking"
  );
  companysizeButton.click();

  await page.waitForTimeout(1000);
  await page.getByText('11-50 employees', { exact: true }).check();

  await page.waitForTimeout(1000);

  await page.getByText('51-200 employees', { exact: true }).check();

  await page.waitForTimeout(1000);

  await page.getByText('201-500 employees', { exact: true }).check();
  
  await page.waitForTimeout(1000);

  const showresultcompanysize = await page.getByRole("button", {
    name: "Apply current filter to show",
  });
  showresultcompanysize.click();
  ////hii this is 


  

  const industryButton = await page.getByLabel("Industry filter. Clicking");
  await industryButton.click();

  await page.waitForTimeout(1000);

  const industryfilter = await page.getByPlaceholder('Add an industry')
  await page.waitForTimeout(1000);

  await industryfilter.fill('Travel Arrangements');

  // await page
  //   .getByLabel("Search filters")
  //   .getByText('Transportation, Logistics,')
  //   .check();

  await page.waitForTimeout(1000); 


//   const spanElementtravel = await page.$('span.t-14.t-black--light.t-normal[aria-hidden="true"]');
// const textContenttravel = await spanElementtravel.textContent();
// if (textContenttravel.trim() === 'Travel Arrangements') {
//     // Perform actions on the element
//     await spanElementtravel.click(); // For example, clicking on the element
// }

  // await page.getByText('Travel Arrangements', { exact: true }).click()
  await page.locator('label').filter({ hasText: 'Travel Arrangements Filter by' }).click()

  await page.waitForTimeout(9000); 

  await industryfilter.fill('Leisure, Travel & Tourism');
  await page.waitForTimeout(1000); 


  await page.getByText('Leisure, Travel & Tourism', { exact: true }).click()

  await page.waitForTimeout(1000); 

  





  // This is how we add wait for timeout timely to avoid any suspicion of automated requests by linkedin 

  const showresultindustry = await page.getByRole("button", {
    name: "Apply current filter to show",
  });

  showresultindustry.click();



  //here we wait for the company size element to become visible 

  

  await page.waitForTimeout(2000);

  const processAnchorTag = async (anchorTag) => {
    console.log(anchorTag);

    console.log("Text:", text);

    // Example: Extract href attribute value
    const href = await anchorTag.getAttribute("href");
    console.log("Href:", href);

    try {
      // Wait for the anchor tag to be visible and enabled
      await anchorTag.waitForElementState("visible");
      await anchorTag.waitForElementState("enabled");

      // Click on the anchor tag
      await anchorTag.click();


      // Return any extracted values
      return { text, href };
    } catch (error) {
      // If an error occurs, retry the interaction after a short delay
      console.error("Error occurred:", error.message);

      await page.waitForTimeout(1000); // Adjust the delay as needed
      // Retry the interaction
    }
  };



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
  "industryText"
  ]);
  
 

//  To  make a count variable for how many copanies data we want to extract 
  let count = 0;
  let companyDetails = [];

  while (count < 600) {
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
        let industryText= null;


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
              var titleText = await companyTitle.innerText();
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
            await page.waitForTimeout(3000);

            console.log("y" + websitelink);

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
            // industry related
            const dtElementindustry = await companyPage.getByText("Industry", {
              exact: true,  
            });
            if (dtElementindustry) {
              // Get the next sibling, which should be the corresponding dd element
              const ddElementindustry = await companyPage.$(
                'dt:has-text("Industry") + dd'
              );

              if (ddElementindustry) {
                // Extract the text content of the dd element
                 industryText = await ddElementindustry.innerText();
                console.log("industrytext:", industryText);
              } else {
                console.error(
                  "No subsequent dd element found for industry."
                );
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

            //Now storing all about fields in an object and then returning

            const finalDetails = {
              companyname: titleText,
              websiteLinks: websitelink,
              FoundationYear: PhoneNumberOrIndustry,
              CompanySize: CompanySize,
              headquarters: headquartersText,
              industryText:industryText,
            };
            console.log("final Details", finalDetails);

            companyDetails.push(finalDetails);
            count++;
          } else {
            console.error("Anchor element not found within result container.");
          }
        } catch (error) {
          console.error(
            "Error occurred while processing result:",
            error.message
          );
        }

        await companyPage.close();
        if (count >= 600) break;
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

      // Loop through the company details and clean up each field
      companyDetails.forEach((company) => {
        company.websiteLinks = cleanUpString(company.websiteLinks);
      });

      console.log("Cleaned Company details:", companyDetails);
    } else {
      console.error("Search results container not found.");
    }

    if (count >= 600) break;

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


  // try



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

// await workbook.xlsx.writeFile("company_details.xlsx");
await workbook.xlsx.writeFile("company_details2.xlsx");

  // Close the browser
  await browser.close();
})();
