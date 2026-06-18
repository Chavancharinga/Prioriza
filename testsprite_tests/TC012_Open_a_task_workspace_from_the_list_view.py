import os
import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )
        context = await browser.new_context()
        context.set_default_timeout(15000)
        page = await context.new_page()

        # Navigate directly to the SPA base path
        await page.goto("http://localhost:5173/Prioriza/")
        await page.wait_for_load_state("domcontentloaded")

        # Fill credentials
        email_input = page.locator("xpath=/html/body/div/div/div/div[2]/form/div/input").nth(0)
        await email_input.wait_for(state="visible", timeout=10000)
        await email_input.fill(os.environ["TESTSPRITE_LOGIN_EMAIL"])

        pass_input = page.locator("xpath=/html/body/div/div/div/div[2]/form/div[2]/input").nth(0)
        await pass_input.fill(os.environ["TESTSPRITE_LOGIN_PASSWORD"])

        # Click Entrar
        btn_entrar = page.locator("xpath=/html/body/div/div/div/div[2]/form/button").nth(0)
        await btn_entrar.click()

        # Click on the first task in the dashboard to open task workspace
        task_elem = page.locator("xpath=/html/body/div/div/div/main/div/div/div[2]/div[2]/div/div").nth(0)
        await task_elem.wait_for(state="visible", timeout=15000)
        await task_elem.click()

        # Assert task details workspace is visible (e.g. Bloco de Notas or Checklist or details window is active)
        checklist_lbl = page.locator("xpath=//*[contains(text(), 'Checklist')]").nth(0)
        await checklist_lbl.wait_for(state="visible", timeout=10000)
        assert await checklist_lbl.is_visible(), "The task workspace should be displayed after opening the task from the list view"

        await asyncio.sleep(2)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

if __name__ == "__main__":
    asyncio.run(run_test())