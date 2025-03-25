export async function removeCookie(
	cookie: browser.cookies.Cookie,
): Promise<void> {
	const protocol = cookie.secure ? "https" : "http";
	await browser.cookies.remove({
		name: cookie.name,
		url: `${protocol}://${cookie.domain}${cookie.path}`,
		storeId: cookie.storeId,
	});
}
