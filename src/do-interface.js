class DigitalOceanInterface {
	constructor(config) {
		this.doToken = config.doToken
		this.originURL = `${ config.spaceName }.${ config.spaceRegion }.digitaloceanspaces.com`
	}

	async purgeCache(files) {
		if (!this.doToken) throw new Error('DigitalOcean API token must be provided to purge CDN cache.')

		try {
			const endpointsRes = await fetch('https://api.digitalocean.com/v2/cdn/endpoints', {
				method: 'get',
				headers: {
					Authorization: `Bearer ${ this.doToken }`
				}
			})

			if (!endpointsRes.ok) throw new Error('Request to DigitalOcean API to retrieve CDN endpoints failed.')

			const { endpoints } = await endpointsRes.json()
			const matchingEndpoint = endpoints.filter((endpoint) => endpoint.origin === this.originURL)[0]

			if (!matchingEndpoint) throw new Error(`Failed to find a matching CDN endpoint for: ${ this.originURL }`)

			const purgeCacheRes = await fetch(`https://api.digitalocean.com/v2/cdn/endpoints/${ matchingEndpoint.id }/cache`, {
				method: 'delete',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${ this.doToken }`
				},
				body: JSON.stringify({
					files: files
				})
			})

			if (!purgeCacheRes.ok) throw new Error('Request to DigitalOcean API to purge cache failed.')
		} catch (err) {
			throw new Error('Purge CDN failed.', { cause: err })
		}
	}
}

module.exports = DigitalOceanInterface