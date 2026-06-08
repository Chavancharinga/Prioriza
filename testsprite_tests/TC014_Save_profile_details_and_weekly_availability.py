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
        await email_input.fill("danieloliveiradasilva261623@gmail.com")

        pass_input = page.locator("xpath=/html/body/div/div/div/div[2]/form/div[2]/input").nth(0)
        await pass_input.fill("261623ruth")

        # Click Entrar
        btn_entrar = page.locator("xpath=/html/body/div/div/div/div[2]/form/button").nth(0)
        await btn_entrar.click()

        # Wait for the dashboard to load, then click the Perfil sidebar button
        btn_profile = page.locator("button[title='Perfil']").nth(0)
        await btn_profile.wait_for(state="visible", timeout=15000)
        await btn_profile.click()

        # Fill full name
        name_input = page.locator("xpath=//input[@placeholder='Seu nome']").nth(0)
        await name_input.wait_for(state="visible", timeout=10000)
        await name_input.fill("Daniel Silva Test")

        # Click "Salvar Alterações"
        btn_save = page.locator("xpath=//button[contains(., 'Salvar Alterações')]").nth(0)
        await btn_save.click()

        # Assert success modal title "Perfil Atualizado" appears
        success_title = page.locator("xpath=//*[contains(text(), 'Perfil Atualizado')]").nth(0)
        await success_title.wait_for(state="visible", timeout=10000)
        assert await success_title.is_visible(), "The success modal should confirm profile update"

        # Click Confirm on the modal
        btn_ok = page.locator("xpath=//button[contains(., 'Confirmar')]").nth(0)
        await btn_ok.click()

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