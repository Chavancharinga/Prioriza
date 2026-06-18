import os
import asyncio
import time
import random
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

        # Click the link to go to Register page "NÃ£o tem uma conta? Cadastre-se"
        btn_switch = page.locator("xpath=//button[contains(text(), 'NÃ£o tem uma conta? Cadastre-se')]").nth(0)
        await btn_switch.wait_for(state="visible", timeout=10000)
        await btn_switch.click()

        # Generate unique registration details
        ts = int(time.time())
        rnd = random.randint(1000, 9999)
        email = f"daniel_test_{ts}_{rnd}@gmail.com"
        username = f"dan_{ts}_{rnd}"

        # Fill name
        name_input = page.locator("xpath=//input[@placeholder='Seu nome completo']").nth(0)
        await name_input.wait_for(state="visible", timeout=10000)
        await name_input.fill("Daniel Test User")

        # Fill username
        user_input = page.locator("xpath=//input[@placeholder='Ex: joao_silva']").nth(0)
        await user_input.fill(username)

        # Fill email
        email_input = page.locator("xpath=//input[@type='email']").nth(0)
        await email_input.fill(email)

        # Fill password
        pass_input = page.locator("xpath=//input[@type='password']").nth(0)
        await pass_input.fill(os.environ["TESTSPRITE_LOGIN_PASSWORD"])

        # Click "Cadastrar" button
        btn_register = page.locator("xpath=//button[type='submit']").nth(0)
        if not await btn_register.is_visible():
            btn_register = page.locator("xpath=//button[contains(text(), 'Cadastrar')]").nth(0)
        await btn_register.click()

        # Assert we landed on the authenticated dashboard (timeline, main elements or dashboard text)
        # In App.jsx, the header title for dashboard is "Gerenciamento de Tarefas"
        dashboard_header = page.locator("xpath=//*[contains(text(), 'Gerenciamento de Tarefas')]").nth(0)
        await dashboard_header.wait_for(state="visible", timeout=15000)
        assert await dashboard_header.is_visible(), "The dashboard should display after successful signup"

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