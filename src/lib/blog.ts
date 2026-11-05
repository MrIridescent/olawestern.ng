export interface BlogPost {
  id: string;
  title: string;
  date: string;
  author: string;
  summary: string;
  content: string;
}

export const posts: BlogPost[] = [
  {
    id: 'meet-mama-funke',
    title: 'Meet Mama Funke: The Heart of the 23 Road Market',
    date: '2026-11-05',
    author: 'Campaign Correspondent',
    summary: 'We turn the microphone around to feature a pillar of our community, a trader in the 23 Road Market, and connect her story to our vision for Amuwo-Odofin.',
    content: `
      <p>For over twenty years, "Mama Funke" has been more than just a trader at the 23 Road Market; she is its heartbeat. Her day starts before the sun rises and ends long after it sets. She knows the story of every stall, every customer, every pothole at the market entrance.</p>
      <p>"We are hardworking people," she says, her hands skillfully arranging produce. "We don't ask for much. Just a clean place to sell, security for our goods, and for the government to see us." Her biggest challenge? The constant worry about sanitation and the flooding that turns the market into a muddy field during the rainy season.</p>
      <p>Mama Funke's story is the story of Amuwo-Odofin's commerce—resilient, vibrant, but held back by neglect. Hon. Ola Western's plan for market modernization isn't just about infrastructure; it's about honoring the work of people like Mama Funke. It's about providing clean, secure, and well-drained market spaces so that our mothers and fathers can trade in dignity.</p>
      <p>"If they fix this place," Mama Funke says with a hopeful smile, "it will change everything. Not just for me, but for everyone." This is who we are fighting for.</p>
    `,
  },
  {
    id: 'a-mandate-for-service',
    title: 'A Mandate for Service: Our Journey Begins',
    date: '2026-06-15',
    author: 'Hon. Ola Western',
    summary: 'Reflecting on our party nomination victory and the path ahead for Amuwo-Odofin.',
    content: `
      <p>My heart is full of gratitude. To my family, my team, our party leaders, and to every one of you who stood by me, I say thank you. This victory is not mine alone; it is a mandate from the people, a shared commitment to the future of Amuwo-Odofin.</p>
      <p>For me, politics has never been about the throne or the title. It is about the pavement, the classrooms, the jobs, and the hope we can build together. This nomination is the start of a new chapter, a solemn promise to turn our progressive ideals into tangible action and restore dignity to our community. The real work begins now.</p>
    `,
  },
  {
    id: 'more-than-concrete',
    title: 'More Than Concrete: The Mind of a Builder, The Heart of a Servant',
    date: '2026-07-01',
    author: 'Hon. Ola Western',
    summary: 'My journey from civil engineering to public service is guided by a single principle: building a better community, one foundation at a time.',
    content: `
      <p>Many know me as a builder, the CEO of Western Concrete Nig. Ltd. I've spent two decades reshaping skylines, but my true passion has always been laying a different kind of foundation in Amuwo-Odofin—a foundation of hope. My training as an accountant and a civil engineer taught me that knowledge is not a trophy, but a tool for service.</p>
      <p>From the Direct Labour Bureau of our LGA to global workshops, I have always sought to turn resources into public good. This campaign is the culmination of that life's work: blending boardroom expertise with street-level compassion to architect a future where every resident of Amuwo-Odofin can thrive.</p>
    `,
  },
  {
    id: 'pavements-of-possibility',
    title: 'Pavements of Possibility: A Detailed Plan for Our Infrastructure',
    date: '2026-07-22',
    author: 'Hon. Ola Western',
    summary: 'We cannot build a thriving economy on broken roads. Here is my granular plan for turning every street into a corridor of commerce and safety.',
    content: `
      <p>As a private citizen, I saw the daily struggles caused by poor infrastructure and I acted. I personally funded the sinking of six boreholes for portable water and the de-silting of critical drainage channels in Mile 2. This was my "widow's mite"—a small contribution to a large problem.</p>
      <p>Now, with a legislative mandate, we will go further. My first priority is to pursue quality legislation that fixes our roads, clears our drainages, and lights up our nights. This isn't just about convenience; it's about creating safe, reliable "Pavements of Possibility" so that our businesses can flourish, our children can travel safely, and our entire community can move without fear.</p>
    `,
  },
  {
    id: 'investing-in-our-people',
    title: 'Our Greatest Asset: Investing in Amuwo's People',
    date: '2026-08-18',
    author: 'Hon. Ola Western',
    summary: 'My agenda for human capital development, focusing on schools that sing, clinics that heal, and empowering our youth, women, and the physically challenged.',
    content: `
      <p>A community is only as strong as its people. That is why my 5-Point Agenda focuses heavily on human capital. We will pursue laws and partnerships to ensure our classrooms birth thinkers and our health centers restore dignity. I have already walked this path, donating baby care kits to our New Year Baby at Mother & Child Hospital and awarding scholarships to bright young minds like Master Chimeremeze Uchendu.</p>
      <p>Furthermore, we must see our youth, women, and the physically challenged not as burdens, but as capital. My administration will champion initiatives that fund skills, tech, and enterprise, transforming our young people into job creators and ensuring every member of our society is empowered to contribute to our collective development.</p>
    `,
  },
  {
    id: 'unlocking-our-potential',
    title: 'Unlocking Our Potential: A Thriving Local Economy for All',
    date: '2026-09-12',
    author: 'Hon. Ola Western',
    summary: 'From our bustling markets to our valuable waterfronts, my plan is to protect traders, empower artisans, and unlock the blue economy of Amuwo-Odofin.',
    content: `
      <p>Commerce is the lifeblood of our community. I will work to protect our traders and empower our artisans with the resources they need to succeed. But our greatest untapped resource is the blue economy of our waterfronts.</p>
      <p>We will pursue legislation to develop this sector responsibly, creating new jobs and opportunities while preserving our natural heritage. My goal is to make Amuwo a hub where labor is honored and wealth is shared, ensuring that the fruits of our economic growth are enjoyed by everyone, not just a select few.</p>
    `,
  },
  {
    id: 'our-strength-is-our-unity',
    title: 'Our Strength is Our Unity: A Government for Every Voice',
    date: '2026-10-05',
    author: 'Hon. Ola Western',
    summary: 'My solemn pact with you: to legislate with transparency, protect the vulnerable, and operate an open-door policy where our diversity is our power.',
    content: `
      <p>My political journey, from the Alliance for Democracy in 1999 to the APC today, has been guided by one unwavering compass: people-first governance. I believe our diversity is our strength and our unity is our power.</p>
      <p>I pledge to lead an all-inclusive government, irrespective of tribe, religion, or social creed. My door will always be open. We will make peace, tolerance, and mutual understanding our first priority. This is not a mere promise; it is my solemn pact with you. Together, we will build a future where every voice is heard and every person is valued.</p>
    `,
  },
];

export function listBlogPosts() {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(id: string) {
  return posts.find((p) => p.id === id);
}