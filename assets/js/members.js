(() => {
	const categoryInfo = {
		executive: { dataKey: 'executives', className: 'members-executives' },
		member: { dataKey: 'members', className: 'members-members' },
		alumni: { dataKey: 'alumni', className: 'members-alumni' },
	};
	const executiveTitleOrder = new Map([
		['President', 0],
		['Vice President', 1],
		['Tournament Host', 2],
		['Contest Host', 3],
		['Treasurer', 4],
	]);
	const fallbackCovers = [
		'https://assets.ppy.sh/user-cover-presets/1/df28696b58541a9e67f6755918951d542d93bdf1da41720fcca2fd2c1ea8cf51.jpeg',
		'https://assets.ppy.sh/user-cover-presets/2/f5142b64b60002f6314b22c775195950105908e149037f4de78efc0e0f28d442.jpeg',
		'https://assets.ppy.sh/user-cover-presets/3/32ddb3eb261e38a82067f9ef4ea96c12f6abf8bd228e6413330f9d351420301b.jpeg',
		'https://assets.ppy.sh/user-cover-presets/7/4a0ccb7b7fdd5c4238b11f0e7c686760fe2c99c6472b19400e82d1a8ff503e31.jpeg',
		'https://assets.ppy.sh/user-cover-presets/9/27963b632594b78ac79c6169756fecd95018ae370ad25f96eae28a919b4b1d58.png',
		'https://assets.ppy.sh/user-cover-presets/10/1e6e3ae468d87bfec64acee31bce234c52c35fbb65cabcd6dabbbc15d4f3f8ee.png',
		'https://assets.ppy.sh/user-cover-presets/12/6e8d3402c8080c2d9549a98321e1bff111dd9c94603ccdb237597479cab6e8a7.jpeg',
		'https://assets.ppy.sh/user-cover-presets/14/af62823c1990a074e038e2ff6aad34aac54b61e48139874f1c8ff46c9d3904a2.png',
		'https://assets.ppy.sh/user-cover-presets/15/8ddd8423001f11dc5b57508720413b22001a0f62acb91cea14219f27fab481f5.png',
		'https://assets.ppy.sh/user-cover-presets/16/60185decfffc3015a84973924195144ec8024e8b9ab61e8ca89a807049f89550.png',
	];

	const element = (tag, className = '', text = '') => {
		const node = document.createElement(tag);
		if (className) node.className = className;
		if (text) node.textContent = text;
		return node;
	};

	const appendIcon = (container, root, name) => {
		const icon = root.querySelector('[data-member-icons]')?.content
			.querySelector(`[data-icon="${name}"] svg`);
		if (icon) container.append(icon.cloneNode(true));
	};

	const appendLinkedSocial = (socials, root, icon, href, label) => {
		const item = element('span', 'member-social-link');
		appendIcon(item, root, icon);
		const link = element('a', '', label);
		link.href = href;
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
		item.append(link);
		socials.append(item);
	};

	const profileImage = (member, mobile = false) => {
		const fallbackAvatar = '/images/fallback-avatar.png';
		const image = element('img', `pfp${mobile ? ' pfp-mobile' : ''} pfp-member`);
		image.src = member.altPfp || (member.userId ? `https://a.ppy.sh/${member.userId}` : fallbackAvatar);
		image.alt = mobile ? '' : `Profile picture for ${member.username}`;
		image.ariaHidden = mobile ? 'true' : 'false';
		image.addEventListener('error', () => {
			if (!image.src.endsWith(fallbackAvatar)) image.src = fallbackAvatar;
		});
		return image;
	};

	const createMemberCard = (member, root) => {
		const coverIndex = member.userId ? Number(member.userId) % fallbackCovers.length : 0;
		const fallbackCover = fallbackCovers[coverIndex];
		const cover = member.bg || (member.userId ? `https://ocover.solstice23.workers.dev/${member.userId}` : fallbackCover);
		const card = element('div', 'member member-member');
		card.style.setProperty('--cover', `url("${cover}"), url("${fallbackCover}")`);
		card.append(profileImage(member));

		const details = element('div', 'member-details');
		const detailsTop = element('div', 'member-details-top');
		detailsTop.append(profileImage(member, true));
		const info = element('div', 'member-info');
		const usernameLine = element('span', 'member-username');
		const username = member.username || member.discord || (member.userId ? `osu! user #${member.userId}` : 'Club member');
		if (member.userId) {
			const profile = element('a', '', username);
			profile.href = `https://osu.ppy.sh/users/${member.userId}`;
			profile.target = '_blank';
			profile.rel = 'noopener noreferrer';
			usernameLine.append(profile);
		} else {
			usernameLine.append(element('span', '', username));
		}
		if (member.name) usernameLine.append(element('span', 'member-name', `(${member.name})`));
		info.append(usernameLine);

		if (member.category === 'executive' && member.role) {
			info.append(element('span', 'member-role', member.role));
		}
		const program = [member.term, member.program, member.year].filter(Boolean).join(' ');
		if (program) info.append(element('span', 'member-program', program));
		detailsTop.append(info);
		details.append(detailsTop);
		const bio = member.bio || member.blurb;
		if (bio) details.append(element('span', 'member-blurb', bio));

		const socials = element('div', 'member-socials');
		if (member.discord) {
			const discord = element('span', 'member-social-link');
			appendIcon(discord, root, 'discord');
			discord.append(document.createTextNode(member.discord));
			socials.append(discord);
		}
		if (member.website) {
			try {
				const website = new URL(member.website);
				appendLinkedSocial(socials, root, 'website', website.href, `${website.host}${website.pathname.replace(/\/$/, '')}`);
			} catch (_) {}
		}
		if (member.github) appendLinkedSocial(socials, root, 'github', `https://github.com/${encodeURIComponent(member.github)}`, member.github);
		if (member.twitch) appendLinkedSocial(socials, root, 'twitch', `https://twitch.tv/${encodeURIComponent(member.twitch)}`, member.twitch);
		if (member.youtube) appendLinkedSocial(socials, root, 'youtube', `https://youtube.com/@${encodeURIComponent(member.youtube)}`, member.youtube);
		if (socials.childElementCount) details.append(socials);
		card.append(details);
		return card;
	};

	const renderMembers = (root, members) => {
		for (const [category, { dataKey }] of Object.entries(categoryInfo)) {
			const container = root.querySelector(`[data-members-category="${category}"]`);
			if (!container) continue;
			const categoryMembers = members.filter(member => member.category === category);
			categoryMembers.sort((left, right) => {
				if (category === 'executive') {
					const roleDifference = (executiveTitleOrder.get(left.role) ?? Number.MAX_SAFE_INTEGER) -
						(executiveTitleOrder.get(right.role) ?? Number.MAX_SAFE_INTEGER);
					if (roleDifference !== 0) return roleDifference;
				}
				return (left.username || left.discord || '').localeCompare(right.username || right.discord || '');
			});
			container.replaceChildren();
			if (!categoryMembers.length) {
				container.append(element('p', 'members-empty', `No ${dataKey} are listed right now.`));
				continue;
			}
			for (const member of categoryMembers) container.append(createMemberCard(member, root));
		}
	};

	window.initMembers = async () => {
		const root = document.querySelector('[data-members-root]');
		if (!root || root.dataset.membersState) return;
		root.dataset.membersState = 'loading';
		const status = root.querySelector('[data-members-status]');
		const loading = root.querySelector('[data-members-loading]');
		const content = root.querySelector('[data-members-content]');
		if (status) {
			status.textContent = 'Loading current members…';
			status.hidden = false;
		}
		if (loading) loading.hidden = false;
		if (content) content.hidden = true;

		try {
			const response = await fetch(root.dataset.membersApi, {
				cache: 'no-store',
				headers: { Accept: 'application/json' },
			});
			if (!response.ok) throw new Error(`Member API returned ${response.status}`);
			const snapshot = await response.json();
			if (snapshot.version !== 1 || !Array.isArray(snapshot.members)) throw new Error('Invalid member snapshot');
			if (!snapshot.generatedAt) {
				root.dataset.membersState = 'waiting';
				renderMembers(root, []);
				if (loading) loading.hidden = true;
				if (content) content.hidden = false;
				if (status) status.hidden = true;
				return;
			}

			renderMembers(root, snapshot.members);
			root.dataset.membersState = 'loaded';
			if (loading) loading.hidden = true;
			if (content) content.hidden = false;
			if (status) status.hidden = true;
		} catch (error) {
			console.warn('Could not load the live member list:', error);
			root.dataset.membersState = 'error';
			if (loading) loading.hidden = true;
			if (content) content.hidden = true;
			if (status) status.textContent = 'We couldn’t load the member list. Please refresh the page to try again.';
		}
	};
})();
