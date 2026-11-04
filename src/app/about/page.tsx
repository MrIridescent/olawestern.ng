import AnimatedText from '@/components/ui/AnimatedText';
import StaggeredCardAnimation from '@/components/ui/StaggeredCardAnimation';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function AboutPage() {
  return (
    <>
      <section className="hero-gradient relative overflow-hidden">
        <div className="container-site grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <AnimatedText>
              <h1 className="font-display text-[1.85rem] font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Hon. Engr. Folorunsho Olaitan Segun (Ola Western)
              </h1>
            </AnimatedText>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-200">
              A comprehensive profile of the man, the engineer, and the community leader.
            </p>
          </div>
        </div>
      </section>

      <section className="container-site py-16">
        <h2 className="section-title">Executive Summary</h2>
        <p className="mt-4 text-base leading-relaxed text-brand-gray">
          Hon. Engr. Folorunsho Olaitan Segun, widely known as "Ola Western," is a Nigerian corporate executive, certified engineer, community leader, and prominent politician within the All Progressives Congress (APC). Based in the Amuwo-Odofin Local Government Area (LGA) of Lagos State, he serves as the Chief Executive Officer of Western Concrete, through which he has established an extensive public footprint built upon corporate social responsibility (CSR), infrastructure intervention, and grassroots philanthropy. His political career is characterized by sustained party loyalty and continuous engagement within the APC, having contested for the Lagos State House of Assembly seat representing Amuwo-Odofin Constituency I across successive electoral cycles. Following his primary victory in May 2022 and subsequent grassroots consolidation, he secured the APC official nomination in May 2026 to fly the party's flag for the Lagos State House of Assembly in the 2027 general elections. Backed by party apex leadership, municipal council executives, and broad cross-ethnic coalitions, his portfolio demonstrates a synthesis of private sector industrial discipline, targeted civic advocacy, and multi-demographic community development.
        </p>
      </section>

      <section className="bg-brand-light py-16">
        <div className="container-site">
          <h2 className="section-title">Biographical and Professional Profile</h2>
          <p className="mt-4 text-base leading-relaxed text-brand-gray">
            Hon. Engr. Folorunsho Olaitan Segun is a certified engineer and corporate administrator whose career bridges heavy industrial management, municipal infrastructure development, and legislative politics. Holding the professional title of Engineer ("Engr."), he combines technical expertise with administrative experience relevant to public utilities management and state legislative processes. As the Chief Executive Officer of Western Concrete, an industrial civil works and concrete manufacturing firm operating within Lagos State, Engr. Folorunsho has directed engineering operations to execute private infrastructure contracts while simultaneously channeling corporate capital into public-private environmental interventions. His professional background serves as the foundation for his public persona, positioning him as a technical expert capable of translating private sector project management efficiency into municipal oversight and state-level policy formulation. Assessments from civic organizations, resident associations, and political stakeholders depict his leadership style as soft-spoken, diplomatic, and consensus-oriented. He advocates for participatory democracy, maintaining an open-door grassroots approach that emphasizes youth inclusion and structured civic engagement across the political wards of Amuwo-Odofin.
          </p>
        </div>
      </section>

      <section className="container-site py-16">
        <h2 className="section-title">Commercial Leadership and Corporate Social Responsibility</h2>
        <p className="mt-4 text-base leading-relaxed text-brand-gray">
          Through his corporate leadership at Western Concrete, Engr. Folorunsho Olaitan Segun has pioneered a model of corporate social responsibility (CSR) directly targeted at resolving chronic municipal infrastructure deficiencies within the Amuwo-Odofin Local Government Area. Recognizing that municipal governments face structural Internally Generated Revenue (IGR) constraints that limit immediate civil maintenance, his firm has regularly intervened to deploy capital, heavy machinery, and technical personnel for public infrastructure works. In a major environmental intervention along the Mile 2 axis, Western Concrete entered into a formal CSR partnership with the Amuwo-Odofin Local Government Council under Executive Chairman Valentine Buraimoh to execute a comprehensive drainage clearing and dredging operation across Ward AI and Ward AII. This project mitigated heavy arterial flooding along critical transit corridors, demonstrating how private industrial capacity can directly reinforce public municipal administration. Beyond drainage maintenance, Engr. Folorunsho’s corporate philanthropic arm has addressed potable water scarcity in urban settlements across Amuwo-Odofin. His organization financed and directed the construction and rehabilitation of borehole facilities across six political wards, improving public health and sanitary conditions for thousands of local residents. Furthermore, in response to urgent appeals from resident associations on 7th Avenue in Festac Town, Western Concrete mobilized heavy desilting equipment to clear long-neglected stormwater channels, establishing an ongoing framework for community-level flood prevention.
        </p>
      </section>

      <section className="bg-brand-light py-16">
        <div className="container-site">
          <h2 className="section-title">Political Trajectory, Electoral History, and Consensus Strategy</h2>
          <p className="mt-4 text-base leading-relaxed text-brand-gray">
            Engr. Folorunsho Olaitan Segun’s political progression within the All Progressives Congress (APC) reflects long-term structural alignment and sustained candidacy for the Amuwo-Odofin Constituency I seat in the Lagos State House of Assembly. During the May 2022 APC primary elections, Engr. Folorunsho contested against the sitting House of Assembly member, Hon. Mojisola Alli-Macaulay. Official primary election results certified by the APC primary election committee recorded a decisive victory for Engr. Folorunsho, who secured 12 delegate votes to defeat the incumbent, who scored 0 votes. Although post-primary friction and broader regional voting dynamics in the 2023 general elections resulted in the opposition capturing the legislative seat, Engr. Folorunsho maintained strict party loyalty, refusing to defect and continuing to finance local APC party organs throughout the post-2023 cycle. To prevent intra-party division and electoral fragmentation in subsequent cycles, APC apex leadership in Amuwo-Odofin established an early consensus framework ahead of the 2027 general elections. In April 2026, party leaders—including Apex Leader Otunba Dotun Adegbola, Apex Chairman Alhaja Memunat Ajao, and Local Government Chairman Prince Lanre Sanusi—unveiled Engr. Folorunsho Olaitan Segun as the party’s consensus candidate for the Lagos State House of Assembly (Constituency I), alongside Moses Olanrewaju ("MO") for the Federal House of Representatives. This strategic consolidation culminated on May 20, 2026, when Engr. Folorunsho swept the official APC House of Assembly primaries for Amuwo-Odofin Constituency I, polling over 3,000 votes to formally secure the party ticket for the 2027 general elections.
          </p>
        </div>
      </section>
    </>
  );
}