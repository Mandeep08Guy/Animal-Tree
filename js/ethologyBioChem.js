/**
 * TerraFauna // Ethology & Neuroendocrinology Knowledge Base
 * Authentic, peer-reviewed developmental ethograms and neuroendocrine chemical cascades
 * for TerraFauna catalog species, grounded in mammalian, avian, amphibian, and reptilian physiology.
 */

export const ETHOLOGY_AND_BIOCHEM_CATALOG = {
  "panthera-leo": {
    lifeStagesAndBehavior: [
      {
        phase: "Den & Nursery Crèche",
        timeframe: "0 - 6 Months",
        behavior: "Cubs remain hidden in dense riverine thickets for the first 4-8 weeks to evade spotted hyenas and leopards. Once introduced to the pride, cubs enter communal crèches where related lionesses nurse alloparentally. Play behavior focuses on stalking, pouncing on twitching tail tufts, and motor coordination.",
        keyActivities: ["Stalking Play", "Allonursing", "Vocal Contact Moaning"],
        environmentalResponse: "Extreme crypsis; female shifts den location every few days if predator scent is detected."
      },
      {
        phase: "Sub-Adult Nomad Coalition",
        timeframe: "2 - 4 Years",
        behavior: "Young males are aggressively evicted by resident pride males as their manes darken. They form bonded bachelor coalitions (often brothers or cousins). Nomad life involves hunting challenging prey in peripheral habitats, honing coordinated ambush tactics, and tracking vulnerable prides.",
        keyActivities: ["Periphery Hunting", "Coalition Scent-Marking", "Reconnaissance Roaring"],
        environmentalResponse: "High mortality phase; avoiding resident male territories by remaining silent and hunting nocturnally."
      },
      {
        phase: "Prime Pride Dominance & Takeover",
        timeframe: "5 - 9 Years",
        behavior: "Coalitions launch violent pride challenges against resident males. Following a successful takeover, males commit infanticide to terminate lactation in pride females and bring them into estrus. Prime males patrol boundaries, roar in chorus at dusk, and monopolize mating rights.",
        keyActivities: ["Boundary Demarcation", "Infanticide & Estrus Induction", "Territory Defense"],
        environmentalResponse: "Intensified patrolling during dry seasons when migratory ungulate herds compress into pride territory."
      },
      {
        phase: "Displaced Nomad & Senescence",
        timeframe: "10+ Years",
        behavior: "Eventually ousted by younger, larger male coalitions. Displaced older males suffer severe claw/bite injuries, loss of coalition partners, and reduced mane density. They transition to scavenging and hunting smaller, slower prey like warthogs and injured ungulates.",
        keyActivities: ["Solitary Scavenging", "Injury Recovery", "Avoidance of Prime Coalitions"],
        environmentalResponse: "Vulnerability to hyena clans; reliance on permanent water holes with dense ambush cover."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Testosterone & Androgen Receptor Surge",
        molecularClass: "Steroid Hormone (C19H28O2)",
        sourceOrgan: "Testicular Interstitial Leydig Cells & Adrenal Cortex",
        triggerContext: "Scent-marking encounters with rival coalitions or auditory perception of alien roars.",
        chemicalMechanism: "Circulating testosterone crosses the blood-brain barrier -> binds high-affinity androgen receptors in the medial amygdala and bed nucleus of the stria terminalis -> down-regulates 5-HT1A serotonergic inhibitory receptors -> up-regulates hypothalamic vasopressin V1a expression.",
        behavioralTransformation: "Triggers ferocious territorial combat, deep-frequency boundary roaring (up to 114 dB), relentless pursuit of intruders, and systemic infanticidal motivation upon pride displacement.",
        icon: "🔥"
      },
      {
        chemicalAgent: "Estradiol & VNO Flehmen Cascade",
        molecularClass: "Estrogen Steroid & Sulfated Steroid Pheromones",
        sourceOrgan: "Ovarian Follicles (Female) -> Vomeronasal Organ (Male)",
        triggerContext: "Detection of female urinary pheromones signaling the onset of follicular phase estrus.",
        chemicalMechanism: "Airborne sulfated steroids bind V2R vomeronasal receptors -> transmits nerve impulses via accessory olfactory bulb to the medial amygdala -> triggers GnRH pulsatile release from hypothalamus -> surges luteinizing hormone (LH).",
        behavioralTransformation: "Induces the iconic Flehmen grimace (lip curling and head elevation) to pump fluid into the vomeronasal duct, followed by continuous consort guarding and copulation every 20-30 minutes for 4 consecutive days.",
        icon: "🧬"
      },
      {
        chemicalAgent: "Epinephrine & Glucocorticoid Ambush Burst",
        molecularClass: "Catecholamine & Corticosteroid",
        sourceOrgan: "Adrenal Medulla & Fasciculata",
        triggerContext: "Visual locking on vulnerable ungulate (zebra, wildebeest) within 30-meter ambush perimeter.",
        chemicalMechanism: "Sympathetic preganglionic fibers stimulate chromaffin cells -> instantaneous release of epinephrine into circulation -> activates beta-2 adrenergic receptors -> causes rapid hepatic glycogenolysis and skeletal muscle vasodilation.",
        behavioralTransformation: "Suppresses peripheral pain sensitivity, accelerates ambush sprint speed to 60-80 km/h in under 3 seconds, and coordinates clamping bite onto prey trachea.",
        icon: "⚡"
      }
    ]
  },

  "loxodonta-africana": {
    lifeStagesAndBehavior: [
      {
        phase: "Calfhood & Allomothering",
        timeframe: "0 - 5 Years",
        behavior: "Calves are constantly shadowed by mothers and adolescent female 'allomothers' who protect them from lions and mudholes. Calves practice motor control over their trunk (which contains over 40,000 distinct muscles) through playful water spraying, tail tugging, and mock charges.",
        keyActivities: ["Trunk Motor Calibration", "Allomother Nursing", "Dust Bathing Socialization"],
        environmentalResponse: "During droughts, calves receive priority access to excavated water seepage pits."
      },
      {
        phase: "Pubertal Expulsion & Bachelor Integration",
        timeframe: "10 - 15 Years",
        behavior: "Young bulls become unruly and sexually mature; resident matriarchs aggressively suppress and evict them from the family herd. Young males join loose, non-hierarchical bachelor groups where older bulls mentor them, suppressing premature violent aggression.",
        keyActivities: ["Bachelor Sparring", "Matrilineal Separation", "Foraging Independence"],
        environmentalResponse: "Young bulls venture into risky agricultural edges and unfamiliar corridors under elder bull guidance."
      },
      {
        phase: "Cyclic Musth Dominance",
        timeframe: "25 - 50 Years",
        behavior: "Bulls enter an annual 2-4 month state of 'Musth' (a period of intense sexual and aggressive hyperactivity). Musth bulls walk with an exaggerated swagger, continuously dribble strong-smelling urine, and challenge any rival regardless of size, dominating breeding access over non-musth bulls.",
        keyActivities: ["Musth Roving", "Estrus Female Interception", "Bull Combat Contests"],
        environmentalResponse: "Musth bulls expand range by 300%, tracking infrasonic estrus rumbles over tens of kilometers."
      },
      {
        phase: "Matriarch Elder & Ecological Memory",
        timeframe: "45 - 65+ Years",
        behavior: "The oldest and largest female leads the extended multi-family clan. She possesses decades of accumulated spatial and acoustic memory, recognizing hundreds of individual elephant voices and navigating the herd to ancient water springs and mineral licks during severe droughts.",
        keyActivities: ["Herd Navigation", "Threat Discrimination", "Infrasonic Network Management"],
        environmentalResponse: "During 50-year drought events, herds led by older matriarchs have significantly lower calf mortality."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Musth Testosterone & Temporin Secretion",
        molecularClass: "Steroid Androgen & Frontalin Ketone Pheromone",
        sourceOrgan: "Interstitial Leydig Cells & Swollen Temporal Glands",
        triggerContext: "Endogenous circannual hypothalamic clock triggering the annual musth cycle in mature bulls.",
        chemicalMechanism: "Plasma testosterone surges up to 60-fold (reaching 50-70 ng/mL compared to normal baseline 1-2 ng/mL) -> temporal glands behind eyes swell and secrete viscous temporin rich in (1R,5S)-frontalin -> binds androgen receptors across the central nervous system.",
        behavioralTransformation: "Transforms calm bulls into hyper-aggressive wanderers; suppresses appetite; induces continuous green urine dribbling (chemically signaling musth status); drives relentless pursuit and mating monopoly over estrus herds.",
        icon: "🔥"
      },
      {
        chemicalAgent: "Oxytocin & Infrasonic Acoustic Bonding",
        molecularClass: "Neurohypophysial Nonapeptide",
        sourceOrgan: "Paraventricular Nucleus (PVN) of Hypothalamus",
        triggerContext: "Physical reunion of related family herds, allomothering contact, and low-frequency rumble vocalizations.",
        chemicalMechanism: "Auditory processing of low-frequency (14-24 Hz) harmonic contact rumbles and trunk-to-mouth tactile contact stimulates paraventricular hypothalamic neurons -> pulses oxytocin into limbic structures and peripheral blood.",
        behavioralTransformation: "Lowers baseline cortisol, cements lifelong cooperative matriarchal alliances, triggers intense ear-flapping greeting ceremonies, and synchronizes herd defense circles around vulnerable calves.",
        icon: "🧬"
      }
    ]
  },

  "physeter-macrocephalus": {
    lifeStagesAndBehavior: [
      {
        phase: "Nursery School Pod",
        timeframe: "0 - 4 Years",
        behavior: "Calves remain in warm tropical and subtropical waters in matrilineal social units of 10-12 females. Because calves cannot dive deep, female pod members take turns babysitting at the surface while others perform 45-minute foraging dives to the abyss.",
        keyActivities: ["Surface Logging", "Allomaternal Babysitting", "Coda Dialect Mimicry"],
        environmentalResponse: "Vulnerability to killer whale attacks; adults form protective rosette 'marguerite' formations around calves."
      },
      {
        phase: "Bachelor Herd Poleward Migration",
        timeframe: "6 - 20 Years",
        behavior: "Sub-adult males detach from their maternal pods and form loose bachelor schools. They begin migrating poleward into subpolar, nutrient-rich seas (Greenland, Antarctic pack ice), progressively separating into smaller groups as body size and dive depth capacity increase.",
        keyActivities: ["Deep Dive Calibration", "High-Latitude Foraging", "Acoustic Ranging"],
        environmentalResponse: "Foraging in cold sub-zero waters; developing massive blubber layers for thermal insulation."
      },
      {
        phase: "Solitary Apex Abyssal Bull",
        timeframe: "25 - 60+ Years",
        behavior: "Fully grown males (up to 18 meters, 50 tonnes) live mostly solitary lives in polar waters, diving to depths of 1,000 - 2,500 meters to hunt colossal and giant squid. Every few years, bulls migrate to the tropics to visit nursery pods and mate, announcing their presence with loud slow clicks.",
        keyActivities: ["Mesopelagic Squid Hunts", "Slow-Click Acoustic Display", "Inter-Bull Head Ramming"],
        environmentalResponse: "Tolerates hydrostatic pressures exceeding 200 atmospheres in total oceanic darkness."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Epinephrine-Mediated Mammalian Dive Reflex",
        molecularClass: "Catecholamine Hormone",
        sourceOrgan: "Adrenal Medulla & Carotid Sinus Baroreceptors",
        triggerContext: "Immersion and descent past 100 meters into hydrostatic high-pressure abyss.",
        chemicalMechanism: "Baroreceptors and facial cold receptors trigger massive sympathetic vasoconstriction via epinephrine release -> peripheral capillary beds in viscera and skeletal muscle completely constrict -> heart rate drops from 60 bpm to 4-8 bpm (extreme bradycardia) -> oxygenated blood is preserved strictly for brain and heart.",
        behavioralTransformation: "Enables 90-120 minute continuous deep dives down to 2,500 meters without breathing; muscle relies entirely on massive myoglobin stores (10x human concentration).",
        icon: "⚡"
      },
      {
        chemicalAgent: "Spermaceti Phase-Change Buoyancy Cascade",
        molecularClass: "Wax Esters & Triglyceride Lipid Matrix",
        sourceOrgan: "Cephalic Spermaceti Organ & Nasal Passages",
        triggerContext: "Transition between surface breathing and 2,000-meter abyssal descent.",
        chemicalMechanism: "Flushing cold 4°C seawater through the right nasal passage cools the spermaceti wax past its 30°C crystallization threshold -> lipid changes from liquid to dense solid -> increases overall head density and negative buoyancy -> allows effortless sinking with zero swimming stroke energy expenditure.",
        behavioralTransformation: "Allows passive gliding descent into the deep mesopelagic zone, conserving vital oxygen for active echolocation hunting of cephalopods.",
        icon: "🧪"
      }
    ]
  },

  "megaptera-novaeangliae": {
    lifeStagesAndBehavior: [
      {
        phase: "Calf Lagoon Weaning",
        timeframe: "0 - 1 Year",
        behavior: "Born in protected, shallow tropical lagoons (Hawaii, Caribbean, Tonga). Calves drink up to 400 liters of 50%-fat milk daily, gaining 50 kg per day. Calves communicate with mothers through ultra-low amplitude 'whisper' grunts to prevent predatory killer whales from overhearing them.",
        keyActivities: ["Milk Nursing", "Acoustic Whispering", "Breaching Calibration"],
        environmentalResponse: "Remain in calm, reef-sheltered shallow waters away from oceanic swells."
      },
      {
        phase: "Polar Foraging & Bubble-Net Mastery",
        timeframe: "2 - 5 Years",
        behavior: "Migrate 8,000 km to polar seas (Alaska, Antarctica) during summer. Young whales learn complex, culturally transmitted foraging techniques from adults, notably cooperative bubble-net feeding where whales coordinate blowhole bubble rings to trap herring and krill schools.",
        keyActivities: ["Bubble-Net Construction", "Hyperphagic Krill Feeding", "Long-Distance Navigation"],
        environmentalResponse: "Hyperphagic feeding 24 hours a day during continuous polar summer daylight to double blubber thickness."
      },
      {
        phase: "Competitive Arena & Mating Song Cycles",
        timeframe: "6 - 40+ Years",
        behavior: "Return to tropical breeding grounds in winter. Males perform elaborate, culturally evolving 20-minute mating songs that travel hundreds of kilometers. Multiple males engage in violent 'competitive surface active groups'—thrashing 5-meter pectoral fins and ramming each other to escort a single female.",
        keyActivities: ["Acoustic Theme Singing", "Competitive Pod Battles", "Breeding Escort"],
        environmentalResponse: "Complete voluntary fasting for 5-8 months; survival relies entirely on metabolizing polar blubber reserves."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Leptin & Ghrelin Fasting Switch",
        molecularClass: "Peptide Metabolic Hormones",
        sourceOrgan: "Subcutaneous Adipose Tissue (Blubber) & Gastrointestinal Tract",
        triggerContext: "Onset of autumn migration away from polar feeding grounds towards the equator.",
        chemicalMechanism: "Massive blubber expansion causes extreme leptin secretion -> desensitizes hypothalamic hunger centers -> suppresses appetite hormone ghrelin -> shifts systemic cellular metabolism entirely to beta-oxidation of fatty acids.",
        behavioralTransformation: "Allows adult humpbacks to undergo 6-8 months of absolute fasting while migrating 8,000 km, performing acrobatic breaches, singing continuous songs, and nursing calves without consuming food.",
        icon: "🧬"
      },
      {
        chemicalAgent: "Testosterone & Seasonal Vocal Plasticity",
        molecularClass: "Steroid Androgen",
        sourceOrgan: "Testicular Interstitial Cells (Gonadal Recrudescence)",
        triggerContext: "Shortening photoperiod triggering pituitary LH/FSH secretion during winter breeding migration.",
        chemicalMechanism: "Winter gonadal hypertrophy drives a massive testosterone pulse -> stimulates laryngeal U-fold muscular expansion -> enhances acoustic vocal endurance -> triggers rapid neuroplastic adoption of new song themes from neighboring pods.",
        behavioralTransformation: "Drives continuous 24-hour acoustic song broadcasts; fuels high-risk competitive group combat with rival males in surface-active mating thrashing.",
        icon: "🔥"
      }
    ]
  },

  "orcinus-orca": {
    lifeStagesAndBehavior: [
      {
        phase: "Matrilineal Pod Calfhood",
        timeframe: "0 - 3 Years",
        behavior: "Calves are born into strict lifelong matrilineal pods. They learn their pod's unique acoustic dialect (distinct vocal repertory of discrete calls). Weaned calves are taught specialized prey-handling skills through staged prey releases by mothers and aunts.",
        keyActivities: ["Dialect Imitation", "Prey Handling Lessons", "Slipstream Swimming"],
        environmentalResponse: "Protected in the center of the traveling pod; never left unattended."
      },
      {
        phase: "Sub-Adult Cooperative Hunting Integration",
        timeframe: "4 - 14 Years",
        behavior: "Integrated into advanced coordinated hunting maneuvers tailored to the pod's ecotype (e.g., synchronous wave-washing to wash seals off ice floes in Antarctica; intentional beaching in Patagonia; carousel herding of herring in Norway).",
        keyActivities: ["Wave-Washing Coordination", "Beach Stranding Practice", "Acoustic Echolocation Eavesdropping"],
        environmentalResponse: "Cultural ecotype specialization: resident fish-eaters never switch to marine mammals, and vice versa."
      },
      {
        phase: "Prime Reproductive Adult",
        timeframe: "15 - 40 Years",
        behavior: "Males grow enormous 1.8-meter triangular dorsal fins; females give birth every 3-7 years. Both sexes remain within their mother's pod for their entire lives. Mating occurs exclusively with members of outside pods during multi-pod super-pod gatherings to prevent inbreeding.",
        keyActivities: ["Cross-Pod Mating Gatherings", "Apex Prey Subjugation", "Social Discipline"],
        environmentalResponse: "Track seasonal salmon runs or pinniped breeding haul-outs with precision."
      },
      {
        phase: "Post-Reproductive Menopausal Matriarch",
        timeframe: "40 - 80+ Years",
        behavior: "Females undergo menopause around age 40 (one of only five mammalian species with menopause) and survive for another 40-50 years. The post-reproductive matriarch leads the pod's travel, remembers historical salmon corridors, and shares up to 60% of caught prey directly with her adult sons.",
        keyActivities: ["Navigation Leadership", "Food Sharing with Sons", "Ecological Archive Preservation"],
        environmentalResponse: "During years of low salmon abundance, pods led by older menopausal grandmothers have significantly higher survival rates."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Menopausal Estrogen Cessation & BDNF Retention",
        molecularClass: "Steroid Ovarian Shutdown & Neurotrophin",
        sourceOrgan: "Ovaries (Follicular Depletion) & Cerebral Cortex",
        triggerContext: "Reaching ~40 years of age; natural exhaustion of primordial ovarian follicle pool.",
        chemicalMechanism: "Ovarian estradiol synthesis permanently drops to near zero -> releases negative feedback on pituitary gonadotropins -> cortical brain-derived neurotrophic factor (BDNF) remains elevated -> preserves executive memory and spatial cognition while eliminating reproductive competition with daughters.",
        behavioralTransformation: "Shifts female role from direct reproduction to grandmaternal leadership, directing pod navigation to distant feeding grounds and dramatically reducing adult offspring mortality.",
        icon: "🧬"
      },
      {
        chemicalAgent: "Oxytocin-Mediated Cooperative Hunting Synchrony",
        molecularClass: "Hypothalamic Nonapeptide",
        sourceOrgan: "Paraventricular Nucleus & Mirror Neuron Networks",
        triggerContext: "Auditory recognition of pod-specific discrete calls during coordinated prey encirclement.",
        chemicalMechanism: "Coordinated motor synchrony (wave-washing, carousel herding) stimulates oxytocin release across the limbic circuit -> dampens intra-pod competitive aggression -> upregulates equitable prey food sharing.",
        behavioralTransformation: "Ensures that high-cost prey (whales, sharks, seal pods) is systematically shared among all pod members, including elderly grandmothers and non-hunting calves.",
        icon: "⚡"
      }
    ]
  },

  "pan-troglodytes": {
    lifeStagesAndBehavior: [
      {
        phase: "Infancy & Tool Imitation",
        timeframe: "0 - 4 Years",
        behavior: "Infants cling ventrally to the mother's abdomen, shifting to dorsal riding at 6 months. Observational learning is intense: infants spend hundreds of hours watching mothers crack nuts with stone anvils or fish for termites with modified twigs, practicing on pebbles.",
        keyActivities: ["Ventral/Dorsal Clinging", "Tool Observation Play", "Nest Bed Construction"],
        environmentalResponse: "Completely dependent on mother's maternal food sharing; screams trigger immediate maternal rescue."
      },
      {
        phase: "Juvenile Independence & Female Dispersal",
        timeframe: "5 - 9 Years",
        behavior: "Juveniles play in rough-and-tumble social groups, developing dominance and alliances. At puberty (~9-11 years), adolescent females voluntarily disperse into neighboring foreign communities to prevent inbreeding, undergoing severe hazing by resident females before acceptance.",
        keyActivities: ["Peer Wrestling", "Maternal Detachment", "Adolescent Dispersal Migration"],
        environmentalResponse: "Dispersing females must quickly learn new geographic territories and appease resident alpha females."
      },
      {
        phase: "Prime Male Coalition Politics & Patrols",
        timeframe: "10 - 25 Years",
        behavior: "Males remain in their natal community for life. High-stakes political machinations occur: males form coalitions with non-relatives through mutual grooming to overthrow the Alpha male. Coalition males conduct silent, lethal territorial border patrols to ambush rivals.",
        keyActivities: ["Coalition Grooming", "Border Patrol Raids", "Display Charging"],
        environmentalResponse: "Territorial border patrols intensify during fruit scarcity to annex neighboring feeding groves."
      },
      {
        phase: "Senior Elder Statesman",
        timeframe: "26 - 45+ Years",
        behavior: "Older males lose peak physical strength and cannot hold the Alpha rank alone. However, they possess high social intelligence, acting as 'kingmakers' who support younger candidates in exchange for meat sharing and social deference. They frequently mediate internal conflicts.",
        keyActivities: ["Conflict Mediation", "Kingmaker Coalitions", "Social Grooming Centrality"],
        environmentalResponse: "Rely on strong social grooming bonds to receive meat portions during cooperative monkey hunts."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Testosterone-Vasopressin Xenophobic Patrol Cascade",
        molecularClass: "Steroid Androgen & Neuropeptide",
        sourceOrgan: "Testes & Supraoptic/Paraventricular Nuclei",
        triggerContext: "Scent marks or auditory pant-hoots of foreign rival chimpanzee communities detected at territory borders.",
        chemicalMechanism: "Perception of foreign territory cues spikes vasopressin V1a receptor binding in the lateral septum while testosterone elevates -> suppresses empathetic mirror neuron signaling -> induces extreme sympathetic arousal without vocalization.",
        behavioralTransformation: "Triggers silent, highly coordinated military-style border patrols; induces lethal coalition attacks on isolated rival males, territory annexations, and infanticide of foreign infants.",
        icon: "🔥"
      },
      {
        chemicalAgent: "Endorphin & Oxytocin Allogrooming Cascade",
        molecularClass: "Endogenous Opioid (Beta-Endorphin) & Nonapeptide",
        sourceOrgan: "Arcuate Nucleus & Posterior Pituitary",
        triggerContext: "Reciprocal finger-parting skin grooming sessions following aggressive dominance displays.",
        chemicalMechanism: "Slow, rhythmic tactile stimulation of C-tactile afferent skin fibers releases beta-endorphins and oxytocin into the ventral striatum -> lowers heart rate -> reduces circulating plasma cortisol by 35-50%.",
        behavioralTransformation: "Dissolves social tension after dominance fights, cements political voting coalitions among non-kin males, and reconciles combatants through mutual mouth-to-mouth kissing.",
        icon: "🧬"
      }
    ]
  },

  "canis-lupus": {
    lifeStagesAndBehavior: [
      {
        phase: "Den Pup Socialization",
        timeframe: "0 - 10 Weeks",
        behavior: "Pups are born blind and deaf inside an excavated earthen den. The mother remains inside while the entire pack hunts and regurgitates meat for her. Pups emerge at 3-4 weeks, establishing a rigid play-fighting dominance hierarchy before their first month concludes.",
        keyActivities: ["Den Emergence", "Meat Regurgitation Begging", "Play Dominance Biting"],
        environmentalResponse: "Den location chosen near permanent water and elevated vantage points away from grizzly bears."
      },
      {
        phase: "Sub-Adult Dispersal & Solo Roaming",
        timeframe: "1 - 3 Years",
        behavior: "Yearling wolves participate in pack hunts. Between ages 1 and 3, many disperse voluntarily, traveling up to 1,000 kilometers across hostile farmland and rival territories to find a vacant range and an unrelated dispersing mate.",
        keyActivities: ["Long-Distance Dispersal", "Scavenger Hunting", "Territory Prospecting"],
        environmentalResponse: "High mortality from highway vehicle strikes, rancher conflicts, and lethal rival pack ambushes."
      },
      {
        phase: "Alpha Pair Leadership & Pack Management",
        timeframe: "3 - 8 Years",
        behavior: "The mated Alpha pair leads the pack (usually an extended family of their offspring). They orchestrate multi-mile pursuit hunts of large ungulates (elk, bison, moose), initiate communal group howling for territory spacing, and maintain exclusive breeding rights.",
        keyActivities: ["Cooperative Ungulate Pursuit", "Chorus Howling Demarcation", "Breeding Monopoly"],
        environmentalResponse: "Winter pack consolidation: pack size swells to bring down massive prey on frozen crust snow."
      },
      {
        phase: "Pack Elder & Post-Alpha Caretaker",
        timeframe: "9 - 13 Years",
        behavior: "Older wolves with worn teeth and arthritis yield active pursuit to younger offspring. They serve vital roles as pack guardians at rendezvous sites, grooming pups, teaching scent recognition, and defending kills against coyotes and cougars.",
        keyActivities: ["Rendezvous Site Guarding", "Pup Nannying", "Carcass Scavenging"],
        environmentalResponse: "Sustained by pack food-sharing; packs with older elders demonstrate higher success in territorial border disputes."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Pheromonal & Cortisol Reproductive Suppression",
        molecularClass: "Sulfated Urinary Steroids & Glucocorticoid",
        sourceOrgan: "Alpha Raised-Leg Urination & Subordinate Adrenal Cortex",
        triggerContext: "Alpha male and female raised-leg urination (RLU) scent-marks throughout the pack territory.",
        chemicalMechanism: "Inhaling alpha urinary pheromones (containing squalene, androst-16-en-3-one) stimulates subordinate olfactory-pituitary axis -> elevates baseline cortisol -> chronically inhibits hypothalamic GnRH secretion -> blocks ovulation and spermatogenesis in subordinate adult offspring.",
        behavioralTransformation: "Chemically ensures that only the Alpha pair reproduces in the pack, channeling all sub-adult energy into alloparental hunting and pup-raising rather than competing for mates.",
        icon: "🧬"
      },
      {
        chemicalAgent: "Vasopressin V1a Monogamous Pair-Bonding",
        molecularClass: "Nonapeptide Hormone",
        sourceOrgan: "Paraventricular Hypothalamus",
        triggerContext: "Winter estrus copulatory tie and cooperative territorial defense with mate.",
        chemicalMechanism: "Copulatory tie and joint territory scent-marking pulses vasopressin into the ventral pallidum and nucleus accumbens -> binds dense V1a receptors -> links mate odor directly to the dopaminergic reward pathway.",
        behavioralTransformation: "Establishes intense lifelong monogamous fidelity between alpha male and female, aggressive intolerance of outside suitors, and synchronized biparental pup rearing.",
        icon: "🔥"
      }
    ]
  },

  "dacelo-novaeguineae": {
    lifeStagesAndBehavior: [
      {
        phase: "Hatchling Sibling Rivalry",
        timeframe: "0 - 4 Weeks",
        behavior: "Chicks hatch synchronously armed with a sharp, specialized hook on their upper beak. Intense siblicide competition occurs in tree hollows; chicks attack each other for food access. The hook reabsorbs completely by fledging.",
        keyActivities: ["Beak Hook Combat", "Food Gulping", "Tree Hollow Begging"],
        environmentalResponse: "During low rainfall and scarce insect abundance, siblicide rates increase to ensure at least one chick survives."
      },
      {
        phase: "Retained Helper at the Nest",
        timeframe: "1 - 4 Years",
        behavior: "Young kookaburras delay dispersal, remaining in their parents' territory as non-breeding 'helpers'. Helpers provide over 30% of all prey (lizards, snakes, rodents) delivered to younger siblings and actively defend the perimeter.",
        keyActivities: ["Sibling Provisioning", "Dawn Chorus Participation", "Snake Mobbing"],
        environmentalResponse: "Prolonged helper retention occurs when surrounding eucalyptus woodlands are saturated with rival territories."
      },
      {
        phase: "Territory Breeding Pair & Chorus Master",
        timeframe: "4 - 15+ Years",
        behavior: "Monogamous pairs occupy permanent year-round territories (up to 100 hectares). At dawn and dusk, the family group gathers on high branches to perform their loud, laughing chorus to prevent neighboring clans from encroaching.",
        keyActivities: ["Dawn/Dusk Laughter Duet", "Arboreal Snake Ambush", "Termite Mound Excavation"],
        environmentalResponse: "Excavates nest hollows inside arboreal termite mounds using their powerful dagger bills."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Prolactin Surge in Non-Breeding Helpers",
        molecularClass: "Anterior Pituitary Peptide",
        sourceOrgan: "Adenohypophysis",
        triggerContext: "Sensory acoustic and visual stimuli from begging younger sibling chicks in the tree hollow nest.",
        chemicalMechanism: "Hearing sibling hunger calls triggers hypothalamic dopamine withdrawal -> releases anterior pituitary lactotrophs -> elevates plasma prolactin levels equivalent to breeding parents.",
        behavioralTransformation: "Drives non-breeding adult helpers to tirelessly forage and feed siblings, clean nest hollows, and brood chicks, completely overriding self-maintenance feeding behavior.",
        icon: "🧬"
      },
      {
        chemicalAgent: "Melatonin Withdrawal Dawn Laughter Chorus",
        molecularClass: "Indoleamine & Adrenal Epinephrine",
        sourceOrgan: "Pineal Gland & Adrenal Chromaffin Cells",
        triggerContext: "First ambient light penetrating eucalyptus canopy at astronomical dawn.",
        chemicalMechanism: "Pineal melatonin rapidly declines as retinal photoreceptors detect morning blue light -> sympathetic activation releases epinephrine -> fires motor neurons in the syrinx -> triggers explosive laughter vocalization.",
        behavioralTransformation: "Coordinates acoustic chorus laughter across the entire family clan, alerting neighboring clans up to 2 km away that territory boundaries remain defended.",
        icon: "⚡"
      }
    ]
  },

  "crocuta-crocuta": {
    lifeStagesAndBehavior: [
      {
        phase: "Neonatal Den Combat",
        timeframe: "0 - 3 Months",
        behavior: "Cubs are born with eyes open, fully erupted incisors, and high muscular coordination. Same-sex twins engage in immediate, violent dominance fights in subterranean birthing dens, sometimes starving the subordinate sibling to death.",
        keyActivities: ["Incisor Dominance Biting", "Private Den Hiding", "Mother Milk Exclusivity"],
        environmentalResponse: "Birthing den entrances are too narrow for adult hyenas or lions to enter, keeping cubs secure."
      },
      {
        phase: "Communal Den Social Hierarchy",
        timeframe: "4 - 18 Months",
        behavior: "Transferred to a communal clan den housing up to 30 cubs. Cubs learn clan etiquette and inherit their mother's exact social rank through maternal intervention. Female cubs dominate all adult males from an early age.",
        keyActivities: ["Rank Rehearsal", "Communal Scent Sniffing", "Clan Greeting Rituals"],
        environmentalResponse: "Mothers nurse cubs for an extraordinary 18 months due to the exceptionally high calcium/protein milk composition."
      },
      {
        phase: "Clan Matriarchal Dominance & Warfare",
        timeframe: "2 - 15+ Years",
        behavior: "Females remain in their natal clan; males disperse to join foreign clans at the bottom of the hierarchy. Clans of up to 80 individuals coordinate massive territory border wars against neighboring hyena clans and actively mob lion prides to hijack kills.",
        keyActivities: ["Border Warfare Mobbing", "Lion Pride Kleptoparasitism", "Bone Crushing (P4 Carnassials)"],
        environmentalResponse: "Crushes and digests whole ungulate bones, extracting marrow with gastric pH 1.3 that dissolves teeth and horns."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Prenatal Androstenedione Masculinization",
        molecularClass: "Steroid Androgen",
        sourceOrgan: "Maternal Ovaries & Placental Trophoblast",
        triggerContext: "Gestation in high-ranking matriarchs with high social aggression levels.",
        chemicalMechanism: "Matriarch ovaries produce massive quantities of androstenedione during pregnancy -> placenta converts this into testosterone -> crosses embryonic barrier -> masculinizes female urogenital anatomy into a pseudo-penis and pseudo-scrotum.",
        behavioralTransformation: "Produces females that are significantly larger, more muscular, and more aggressive than males, establishing complete female dominance across the clan hierarchy.",
        icon: "🔥"
      },
      {
        chemicalAgent: "Dopaminergic Giggle & Pitch Modulation",
        molecularClass: "Biogenic Amine Neurotransmitter",
        sourceOrgan: "Substantia Nigra & Ventral Tegmental Area",
        triggerContext: "Competitive feeding frenzies on large carcasses and high-arousal clan reunions.",
        chemicalMechanism: "Arousal and food competition trigger sudden dopamine pulses -> modulates syringeal and vocal fold muscle tension -> generates high-frequency, staccato 'laughter/giggle' vocalizations.",
        behavioralTransformation: "Acoustically encodes the age, social status, and individual identity of the caller, signaling frustration, appeasement, or rallying clan reinforcements against lions.",
        icon: "⚡"
      }
    ]
  },

  "magicicada-septendecim": {
    lifeStagesAndBehavior: [
      {
        phase: "Subterranean Xylem Tap Nymph",
        timeframe: "Years 1 - 16",
        behavior: "Nymphs spend 16.9 years underground, burrowed 30-60 cm deep. They tap into deciduous tree root xylem vessels using their piercing-sucking stylets, feeding on dilute sap while counting annual tree seasonal cycles.",
        keyActivities: ["Root Xylem Tapping", "Subterranean Burrow Excavation", "Annual Sap Cycle Counting"],
        environmentalResponse: "Completely sheltered from surface weather fluctuations, predators, and seasonal droughts."
      },
      {
        phase: "Synchronized Mass Emergence",
        timeframe: "Year 17, Month 5 (Days 1 - 3)",
        behavior: "Triggered precisely when soil temperatures at 20 cm reach 18°C (64°F). Billions of nymphs emerge simultaneously overnight, climb vertical tree trunks, split their nymphal cuticles, and eclose into winged adults before dawn.",
        keyActivities: ["Nocturnal Tree Ascent", "Exoskeleton Ecdysis", "Wing Inflation & Sclerotization"],
        environmentalResponse: "Predator satiation strategy: billions emerge at once so predators (birds, raccoons) gorge to fullness while >98% survive."
      },
      {
        phase: "Acoustic Canopy Chorus & Mating Blitz",
        timeframe: "Adult Weeks 1 - 4",
        behavior: "Adult males gather in upper canopy 'chorusing centers', vibrating abdomen tymbals to produce deafening 100 dB drone choruses. Females respond with wing-flicks; mating occurs, females slice twigs to oviposit 400 eggs, and all adults die within 4 weeks.",
        keyActivities: ["Tymbal High-dB Chorusing", "Wing-Flick Mating Courtship", "Twig Oviposition Slitting"],
        environmentalResponse: "Adults possess no defensive stingers; rely purely on acoustic congregation and terminal semelparity."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Juvenile Hormone (JH) Diapause Brake",
        molecularClass: "Sesquiterpenoid Insect Hormone",
        sourceOrgan: "Corpora Allata",
        triggerContext: "Endogenous biological clock counting 17 cycles of spring tree amino acid surges.",
        chemicalMechanism: "High circulating titers of juvenile hormone (JH III) actively repress the expression of adult metamorphic genes -> maintains subterranean nymphal arrest through 5 consecutive nymphal instars over 16 full years.",
        behavioralTransformation: "Locks the insect in continuous slow underground burrowing and xylem feeding, preventing premature emergence during unseasonal warm spells.",
        icon: "🧪"
      },
      {
        chemicalAgent: "20-Hydroxyecdysone (20E) Metamorphic Ignition",
        molecularClass: "Steroidal Ecdysteroid",
        sourceOrgan: "Prothoracic Glands",
        triggerContext: "Soil temperature crossing 18°C in the spring of the 17th consecutive year.",
        chemicalMechanism: "Accumulated thermal units stimulate brain neurosecretory cells -> releases prothoracicotropic hormone (PTTH) -> triggers massive surge of 20-hydroxyecdysone while JH drops to zero -> activates ecdysone nuclear receptor (EcR).",
        behavioralTransformation: "Triggers immediate cessation of feeding, upward burrowing to the surface, mass nocturnal tree ascent, ecdysis shedding, and rapid wing sclerotization within 6 hours.",
        icon: "⚡"
      }
    ]
  },

  "acinonyx-jubatus": {
    lifeStagesAndBehavior: [
      {
        phase: "Mantle Camouflage Cubhood",
        timeframe: "0 - 4 Months",
        behavior: "Cubs possess a long, smoky-gray dorsal mane ('mantle') running from neck to tail. This remarkable adaptation mimics the aggressive honey badger (Mellivora capensis), deterring aerial raptors and baboons while mother hunts.",
        keyActivities: ["Honey Badger Mimicry", "Mantle Camouflage", "Meat Gnawing Practice"],
        environmentalResponse: "Cubs freeze flat against grass when mother chirps an acoustic alert signal."
      },
      {
        phase: "Sibling Coalition & Hunting School",
        timeframe: "14 - 20 Months",
        behavior: "Mother leaves adolescent cubs. Brothers remain together in lifelong male coalitions (2-4 individuals), pooling strength to defend prime territories. Sisters disperse into vast solitary home ranges that overlap multiple male territories.",
        keyActivities: ["Sibling Gazelle Chases", "Coalition Territory Marking", "Predator Scanning"],
        environmentalResponse: "Cooperative coalitions can defend territories up to 3x longer than solitary males."
      },
      {
        phase: "Apex Sprint Ambush Specialist",
        timeframe: "2 - 10+ Years",
        behavior: "Diurnal hunting specialist to avoid nocturnal lions and hyenas. Uses binoculars-like stereoscopic vision to spot Thomson's gazelles from termite mounds. Closes distance to 50 meters, accelerates to 100 km/h in 3 seconds, trips prey with dewclaw, and clamps trachea.",
        keyActivities: ["Termite Mound Scanning", "100 km/h Pursuit Sprint", "Rapid Carcass Ingestion"],
        environmentalResponse: "Must consume meat immediately before larger predators (hyenas, vultures) detect the kill and pirate it."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Sympathoadrenal Epinephrine Explosive Dump",
        molecularClass: "Catecholamine Hormone",
        sourceOrgan: "Adrenal Medulla Chromaffin Granules",
        triggerContext: "Visual locking on fleeing prey breaking cover within 60-meter sprint range.",
        chemicalMechanism: "Splanchnic nerve discharge dumps massive epinephrine into circulation -> activates cardiac beta-1 receptors (accelerating heart rate to 250 bpm) and bronchial beta-2 receptors -> dilates large nasal airways -> mobilizes muscle glycogen.",
        behavioralTransformation: "Enables explosive acceleration: 0 to 100 km/h in 3 seconds with 7-meter strides, flexing the flexible spine like a spring during high-speed turns.",
        icon: "⚡"
      },
      {
        chemicalAgent: "Anaerobic Lactic Acid & Thermal Exhaustion Shutdown",
        molecularClass: "Lactate (C3H5O3-) & Severe Metabolic Acidosis",
        sourceOrgan: "Fast-Twitch Type IIb Skeletal Muscle Fibers",
        triggerContext: "Sustaining maximum sprint velocity beyond 400 meters.",
        chemicalMechanism: "Extreme sprint demands outpace circulatory oxygen delivery -> muscles switch entirely to anaerobic glycolysis -> lactic acid accumulates -> blood pH crashes from 7.4 to 7.05 -> core body temperature spikes past 40.5°C.",
        behavioralTransformation: "Chemically shuts down neuromuscular contraction; forces cheetah to immediately halt sprint, pant at 150 breaths/min, and rest for 30 minutes before it can consume the captured prey.",
        icon: "🔥"
      }
    ]
  },

  "ambystoma-mexicanum": {
    lifeStagesAndBehavior: [
      {
        phase: "Aquatic Larval Development",
        timeframe: "0 - 6 Months",
        behavior: "Larvae hatch in high-altitude freshwater canal networks of Lake Xochimilco. They possess translucent skin, dorsal tail fins, and three pairs of external branching gill stalks with crimson capillary loops, feeding on zooplankton and daphnia.",
        keyActivities: ["Plankton Suction Snapping", "Gill Flap Respiration", "Rapid Digit Regeneration"],
        environmentalResponse: "Thrives in cold, oxygenated, slow-moving freshwater canals rich in aquatic vegetation."
      },
      {
        phase: "Obligate Neotenic Adult",
        timeframe: "6 Months - 15+ Years (Life-long)",
        behavior: "Reaches full sexual maturity without ever undergoing metamorphosis. Retains external gills, aquatic tail fin, and underwater lifestyle for its entire natural lifespan. Male deposits spermatophores on aquatic plants; female collects them with her cloaca.",
        keyActivities: ["Spermatophore Courtship", "Suction Foraging", "Epimorphic Limb Regeneration"],
        environmentalResponse: "Remarkable cellular plasticity: able to regenerate whole limbs, retinas, heart ventricles, and brain sections without scarring."
      },
      {
        phase: "Experimental Terrestrial Metamorphosis",
        timeframe: "Induced (Laboratory Only)",
        behavior: "Occurs only under artificial chemical administration of iodine or thyroxine. The axolotl reabsorbs its external gills, resorbs its swimming tail fin, sheds its larval skin, develops eyelids, and crawls out of water onto land as an air-breathing terrestrial salamander.",
        keyActivities: ["Gill Resorption", "Pulmonary Air Breathing", "Terrestrial Crawling"],
        environmentalResponse: "Extremely stressful state; terrestrial morphs have significantly shortened lifespans."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Pituitary TSH & Thyroxine (T4) Synthesis Arrest",
        molecularClass: "Glycoprotein Hormone & Tyrosine Hormone Deficiency",
        sourceOrgan: "Anterior Pituitary & Thyroid Gland Follicles",
        triggerContext: "Genetic evolutionary adaptation to high-altitude, predator-free, nutrient-rich lake environment.",
        chemicalMechanism: "Genetic mutation in the hypothalamic-pituitary-thyroid (HPT) axis leaves the pituitary unable to secrete bioactive thyroid-stimulating hormone (TSH) -> thyroid follicles remain inactive and synthesize virtually zero thyroxine (T4) or triiodothyronine (T3).",
        behavioralTransformation: "Permanently halts amphibian metamorphosis; locks the organism in perpetual juvenile larval morphology while allowing full gonadal sexual reproduction to proceed.",
        icon: "🧬"
      },
      {
        chemicalAgent: "Induced Thyroxine Nuclear Receptor Ignition",
        molecularClass: "Triiodothyronine (T3) & Nuclear Receptor (TRα/TRβ)",
        sourceOrgan: "Exogenous Environmental Addition (Lab Iodine/T4 Injection)",
        triggerContext: "Artificial lab immersion in potassium iodide or direct L-thyroxine administration.",
        chemicalMechanism: "Exogenous T3 binds thyroid hormone nuclear receptors (TRα/TRβ) -> forms heterodimers with RXR -> binds thyroid response elements (TRE) across DNA -> triggers massive matrix metalloproteinase (MMP) transcription.",
        behavioralTransformation: "Initiates programmatic apoptotic cell death of external gill stalks, reorganizes skin into stratified cornified epidermis, develops eyelids, and forces the animal to abandon water and crawl onto land.",
        icon: "🧪"
      }
    ]
  },

  "varanus-komodoensis": {
    lifeStagesAndBehavior: [
      {
        phase: "Arboreal Cryptic Phase",
        timeframe: "0 - 3 Years",
        behavior: "Hatchlings immediately scramble up high tamarind trees upon leaving subterranean nesting mounds. They live entirely in the canopy for up to three years, feeding on geckos, bird eggs, and insects to avoid being cannibalized by adult Komodo dragons.",
        keyActivities: ["Canopy Camouflage", "Gecko Hunting", "Cannibalism Avoidance"],
        environmentalResponse: "Hatchlings roll in adult dragon fecal matter when descending to mask their scent from adult predators."
      },
      {
        phase: "Sub-Adult Terrestrial Scavenger",
        timeframe: "3 - 7 Years",
        behavior: "Descend to the forest floor as weight exceeds 15 kg. They track adult dragon feeding sites, waiting on the periphery to dart in for carcass scraps. They develop territory navigation and practice bite-and-release ambush tactics on small deer.",
        keyActivities: ["Periphery Scavenging", "Ambush Rehearsal", "Burrow Excavation"],
        environmentalResponse: "Avoid adult males by raising front limbs and swinging neck in submissive appeasement postures."
      },
      {
        phase: "Apex Ambush Master & Combatant",
        timeframe: "8 - 30+ Years",
        behavior: "Apex predator of the Lesser Sunda Islands. Adults reach up to 3 meters and 70 kg. They lie in wait along game trails, deliver a single devastating bite with recurved serrated teeth, and inject hypotensive venom. They trail the dying prey using forked tongue vomeronasal chemoreception.",
        keyActivities: ["Game Trail Ambush", "Bipedal Combat Wrestling", "Forked-Tongue Chemoreception"],
        environmentalResponse: "Thermoregulation: basking on morning rocks to raise core temperature before hunting in savanna scrub."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Mandibular Venom PLA2 & Hypotensive Peptides",
        molecularClass: "Phospholipase A2 & Natriuretic Peptide Toxin Cocktail",
        sourceOrgan: "Bilateral Submandibular Venom Glands",
        triggerContext: "Biting ambush strike on large prey (Timor deer, water buffalo, wild boar).",
        chemicalMechanism: "Recurved serrated teeth tear deep lacerations -> submandibular glands compress via jaw adductor muscles, pumping venom into wound -> natriuretic peptides induce extreme peripheral vasodilation -> PLA2 inhibits platelet aggregation and blocks blood clotting.",
        behavioralTransformation: "Causes catastrophic hypotensive shock, hypothermia, and uncontrollable internal bleeding in prey; allows dragon to calmly follow scent trail over several days until prey collapses.",
        icon: "🧪"
      },
      {
        chemicalAgent: "Corticosterone & Plasma Androgen Ritual Wrestling",
        molecularClass: "Glucocorticoid & Steroid Androgen",
        sourceOrgan: "Adrenal Gland & Testicular Leydig Cells",
        triggerContext: "Encountering rival mature male near female nesting mound during July mating season.",
        chemicalMechanism: "Visual appraisal of rival triggers acute corticosterone and testosterone secretion -> elevates skeletal muscle grip strength -> triggers bipedal balance motor circuits in the hind limbs and tail.",
        behavioralTransformation: "Rivals rear up on hind legs in dramatic bipedal wrestling matches, grappling chests and attempting to slam each other to the ground; loser flees while victor claims exclusive mating rights.",
        icon: "🔥"
      }
    ]
  },

  "ornithorhynchus-anatinus": {
    lifeStagesAndBehavior: [
      {
        phase: "Burrow Hatchling & Milk Licking",
        timeframe: "0 - 4 Months",
        behavior: "Hatch from small, leathery eggs inside a 20-meter excavated nesting burrow. Platypuses lack nipples; mothers secrete milk from modified sweat gland pores onto abdominal skin grooves, where hatchlings lick it from fur patches.",
        keyActivities: ["Abdominal Milk Licking", "Burrow Nest Snuggling", "Bill Mechanoreceptor Growth"],
        environmentalResponse: "Mother plugs burrow entrance with earthen soil walls every time she leaves to prevent flooding and snake predation."
      },
      {
        phase: "Sub-Adult Electroreceptive Independence",
        timeframe: "5 - 18 Months",
        behavior: "Leave the burrow to hunt in freshwater riffles. They close their eyes, ears, and nostrils underwater, hunting entirely through bill electroreception (detecting electrical impulses from shrimp tail flicks) and mechanoreception.",
        keyActivities: ["Benthic Substrate Sweeping", "Cheek-Pouch Food Storing", "Gravel Mastication"],
        environmentalResponse: "High food intake requirement: consumes up to 20% of their body weight in freshwater crustaceans daily."
      },
      {
        phase: "Territorial Adult & Spring Spur Envenomation",
        timeframe: "2 - 12+ Years",
        behavior: "Adult males occupy linear stream territories overlapping several females. During the spring breeding season, males become intensely aggressive toward rival males, deploying venomous calcaneus spurs on their hind ankles in violent wrestling matches.",
        keyActivities: ["Territory Stream Patrolling", "Male Calcaneus Spur Combat", "Aquatic Courtship Spirals"],
        environmentalResponse: "Maintain high metabolic rate (32°C body temperature) in near-freezing mountain streams using dense waterproof fur."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Seasonal Crural Venom Hypertrophy Cascade",
        molecularClass: "Defensin-Like Peptides (DLP) & C-Type Natriuretic Peptides (CNP)",
        sourceOrgan: "Male Calcaneus Crural Venom Gland",
        triggerContext: "Spring photoperiod lengthening triggering annual male mating cycle.",
        chemicalMechanism: "Seasonal androgen surge stimulates dramatic hypertrophy of the crural venom glands on the hind legs -> synthesizes a unique cocktail of defensin-like peptides (DLP), hyaluronidase, and natriuretic peptides -> connects via duct to calcaneus hollow spurs.",
        behavioralTransformation: "Males deploy spurs exclusively during male-male mating combats; venom causes agonizing hyperalgesia (extreme long-lasting pain insensitive to morphine) and temporary hind-limb paralysis in rival males.",
        icon: "🧪"
      },
      {
        chemicalAgent: "Melatonin-Gated Nocturnal Diving Rhythm",
        molecularClass: "Indoleamine Neurohormone",
        sourceOrgan: "Pineal Gland",
        triggerContext: "Dusk darkness falling over freshwater stream channels.",
        chemicalMechanism: "Onset of darkness triggers high melatonin secretion -> activates central foraging arousal circuits -> down-regulates visual cortex reliance while up-regulating trigeminal electroreceptive sensory processing in bill cortex.",
        behavioralTransformation: "Initiates continuous nocturnal hunting: performs up to 80 consecutive foraging dives per hour through total riverbed darkness, locating buried crayfish via 40,000 bill electroreceptors.",
        icon: "⚡"
      }
    ]
  },

  "tursiops-truncatus": {
    lifeStagesAndBehavior: [
      {
        phase: "Calfhood & Signature Whistle Formation",
        timeframe: "0 - 3 Years",
        behavior: "Calves swim in the hydrodynamic 'infant position' beside the mother's flank, pulled along by her slipstream. During its first year, every dolphin invents a unique acoustic frequency-modulated 'signature whistle' that acts as its personal name for life.",
        keyActivities: ["Slipstream Nursing", "Signature Whistle Invention", "Echolocation Calibration"],
        environmentalResponse: "Mothers steer calves away from deep shipping channels and shark-infested reef drop-offs."
      },
      {
        phase: "First-Order Bachelor Alliance",
        timeframe: "4 - 10 Years",
        behavior: "Young males form close pairs or trios ('first-order alliances') with peer males. These alliances persist for decades: bonded pairs coordinate synchronous breathing, tail-slapping, and cooperative herding of fish schools against beaches.",
        keyActivities: ["Synchronous Alliance Swimming", "Cooperative Mud-Ring Herding", "Sponge Tool Use"],
        environmentalResponse: "In Shark Bay, some matrilineal lines teach daughters to hold marine basket sponges over their beaks to probe rocky seafloors."
      },
      {
        phase: "Second-Order Alliance & Estrus Herding",
        timeframe: "11 - 35+ Years",
        behavior: "Multiple first-order alliances band together into 'second-order super-alliances' of up to 14 males. They coordinate military-style raids to herd single receptive females or defend against raids from neighboring alliances.",
        keyActivities: ["Super-Alliance Raids", "Synchronized Acoustic Popping", "Fluke Slap Demarcation"],
        environmentalResponse: "High acoustic intelligence: pods coordinate hunting with human artisanal fishermen in Laguna, Brazil."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Oxytocin & Vasotocin Alliance Bonding",
        molecularClass: "Neurohypophysial Nonapeptides",
        sourceOrgan: "Hypothalamus & Limbic System",
        triggerContext: "Synchronous swimming, acoustic whistle matching, and flipper-to-body petting rituals.",
        chemicalMechanism: "Tactile flipper petting and synchronized breathing stimulate paraventricular hypothalamic neurons -> releases oxytocin and arginine vasotocin -> binds receptors in the amygdala and nucleus accumbens.",
        behavioralTransformation: "Cements lifelong cooperation between non-relative males in alliances that last up to 30 years; drives cooperative defense against predatory tiger sharks and coordinated female consort herding.",
        icon: "🧬"
      },
      {
        chemicalAgent: "Echolocation Dopaminergic Target Reward",
        molecularClass: "Monoamine Neurotransmitter",
        sourceOrgan: "Ventral Tegmental Area (VTA) & Acoustic Cortex",
        triggerContext: "Successful acoustic discrimination of buried benthic fish via acoustic melon clicks.",
        chemicalMechanism: "Auditory processing of return echoes via mandibular fat pads stimulates ventral striatum -> triggers rapid dopamine release upon positive target discrimination.",
        behavioralTransformation: "Reinforces intense acoustic focus, allowing the dolphin to emit up to 1,000 clicks per second and detect buried flatfish beneath 30 cm of ocean sediment.",
        icon: "⚡"
      }
    ]
  },

  "poecile-atricapillus": {
    lifeStagesAndBehavior: [
      {
        phase: "Summer Fledgling & Syntax Acquisition",
        timeframe: "0 - 3 Months",
        behavior: "Fledglings follow parents in family parties through temperate forests. They acquire the precise combinatorial syntax of the 'chick-a-dee' call, learning that adding more 'dee' notes encodes higher threat levels from small raptors.",
        keyActivities: ["Acoustic Syntax Practice", "Insect Foraging", "Predator Mobbing Rehearsal"],
        environmentalResponse: "Fledglings quickly learn to recognize pygmy owl calls and mob predators en masse."
      },
      {
        phase: "Autumn Seed Caching Marathon",
        timeframe: "4 - 6 Months",
        behavior: "During autumn, each chickadee caches up to 100,000 individual sunflower seeds, conifer nuts, and insect pupae across thousands of bark crevices, lichens, and needle clumps, remembering the exact spatial location of each cache.",
        keyActivities: ["Spatial Cache Memorization", "Bark Poking", "Flock Territory Integration"],
        environmentalResponse: "Caching intensifies dramatically during weeks preceding early winter snowstorms."
      },
      {
        phase: "Winter Flock Linear Hierarchy",
        timeframe: "7 - 24+ Months",
        behavior: "Forms tight winter foraging flocks of 6-12 individuals with strict linear dominance hierarchies. Alpha pairs feed first at cache sites; low-ranking birds take higher foraging risks on open outer branches.",
        keyActivities: ["Linear Rank Pecking", "Sub-Zero Nocturnal Hypothermia", "Cache Retrieval"],
        environmentalResponse: "To survive -30°C winter nights, chickadees enter regulated nocturnal hypothermia, lowering core temp by 12°C."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "BDNF-Driven Hippocampal Neurogenesis",
        molecularClass: "Brain-Derived Neurotrophic Factor (BDNF)",
        sourceOrgan: "Telencephalic Ventricular Zone & Hippocampal Formation",
        triggerContext: "Autumn shortening photoperiod and intensive spatial caching activity.",
        chemicalMechanism: "Declining photoperiod upregulates BDNF and downregulates testosterone -> stimulates proliferation of neuronal precursor cells in the subventricular zone -> thousands of new neurons migrate into the hippocampus -> hippocampus expands physically by ~30% in volume.",
        behavioralTransformation: "Provides the extraordinary spatial memory capacity required to accurately locate and retrieve up to 100,000 hidden food caches across hundreds of hectares throughout winter snows.",
        icon: "🧬"
      },
      {
        chemicalAgent: "Corticosterone Hypothermic Torpor Balance",
        molecularClass: "Glucocorticoid Hormone",
        sourceOrgan: "Avian Adrenal Gland",
        triggerContext: "Severe sub-zero nocturnal temperature drop during winter blizzards.",
        chemicalMechanism: "Acute cold stress stimulates corticosterone secretion -> coordinates metabolic transition to nocturnal hypothermia (dropping core body temperature from 42°C to 30°C) -> triggers controlled pectoralis muscle micro-shivering.",
        behavioralTransformation: "Reduces nocturnal energy expenditure by 25%, preventing starvation and fat reserve depletion overnight; returns to normal body temperature immediately before morning dawn.",
        icon: "⚡"
      }
    ]
  },

  "dendrobates-tinctorius": {
    lifeStagesAndBehavior: [
      {
        phase: "Paternal Bromeliad Backpacking",
        timeframe: "0 - 2 Months",
        behavior: "Eggs are laid in moist leaf litter. The father guards the clutch; upon hatching, tadpoles wriggle onto his back, held by sticky mucus. The father climbs 30 meters up rainforest canopy trees, depositing each tadpole into a separate water-filled bromeliad leaf axil.",
        keyActivities: ["Tadpole Backpacking", "Canopy Tree Ascent", "Bromeliad Axil Deposition"],
        environmentalResponse: "Separating tadpoles prevents cannibalism among siblings in small bromeliad pools."
      },
      {
        phase: "Metamorphic Dietary Alkaloid Sequestration",
        timeframe: "3 - 8 Months",
        behavior: "Froglets emerge onto the forest floor. They do not synthesize toxins endogenously; instead, they selectively consume venomous formicine ants and oribatid mites, bio-accumulating and chemically sequestering toxic alkaloids into specialized skin glands.",
        keyActivities: ["Formicine Ant Foraging", "Skin Granular Gland Filling", "Aposematic Color Intensification"],
        environmentalResponse: "Frogs raised on fruit fly diets in captivity completely lose their skin toxicity."
      },
      {
        phase: "Aposematic Territorial Dominance",
        timeframe: "1 - 6+ Years",
        behavior: "Adults exhibit bold, vibrant blue and yellow aposematic warning coloration. Confident in their chemical immunity, they forage openly in broad daylight on the forest floor. Males engage in aggressive bipedal belly-to-belly wrestling matches to defend fallen logs.",
        keyActivities: ["Diurnal Open Foraging", "Bipedal Belly Wrestling", "Territory Buzz Calling"],
        environmentalResponse: "Complete lack of anti-predator flight; frogs do not flee from large animals due to lethal skin toxins."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Pumiliotoxin & Allopumiliotoxin Bio-Sequestration",
        molecularClass: "Steroidal & Lipophilic Poison Alkaloids",
        sourceOrgan: "Formicine Ant Prey -> Cutaneous Granular Glands",
        triggerContext: "Dietary consumption of formicine ants containing pumiliotoxin precursors.",
        chemicalMechanism: "Alkaloids absorbed through gut epithelium without metabolization -> transported via blood to skin granular serous glands -> concentrated and secreted onto dorsal epidermis -> binds voltage-gated sodium channels in predator nerves, keeping them permanently open.",
        behavioralTransformation: "Induces severe cardiotoxic convulsions and paralysis in any predator attempting to ingest the frog; eliminates predator evasion flight, allowing the frog to hunt and display openly in daylight.",
        icon: "🧪"
      },
      {
        chemicalAgent: "Pheromonal Egg-Feeding Communication",
        molecularClass: "Cutaneous Peptide Pheromones",
        sourceOrgan: "Tadpole Skin Glands -> Mother Olfactory System",
        triggerContext: "Father guiding mother frog to inspect water-filled bromeliad housing hungry tadpole.",
        chemicalMechanism: "Tadpole vibrates water surface and releases tactile/chemical peptide cues -> mother detects cues -> triggers ovulation of a single unfertilized nutrient egg directly into the water for the tadpole to consume.",
        behavioralTransformation: "Ensures the tadpole receives protein-dense maternal trophic eggs to complete metamorphosis inside nutrient-poor bromeliad pools.",
        icon: "🧬"
      }
    ]
  },

  "cynomys-gunnisoni": {
    lifeStagesAndBehavior: [
      {
        phase: "Coterie Burrow Nursery",
        timeframe: "0 - 6 Weeks",
        behavior: "Altricial pups are born blind and hairless in deep subterranean nesting chambers. Pups emerge above ground in early summer, greeting clan members with 'identification kisses' (touching incisors and tongues) to learn kinship odor profiles.",
        keyActivities: ["Identification Kissing", "Subterranean Nursing", "Kin Odor Imprinting"],
        environmentalResponse: "Burrows feature elevated crater rims to prevent flash flooding and provide 360-degree predator scan vantages."
      },
      {
        phase: "Yearling Dispersal & Tunnel Engineering",
        timeframe: "1 Year",
        behavior: "Young males disperse across the colony complex ('town') to establish or usurp vacancies in peripheral coteries. Females remain in their natal coteries for life. Yearlings expand multi-tier tunnel networks with designated flood bunkers and listening posts.",
        keyActivities: ["Coterie Boundary Migration", "Tunnel Architecture Excavation", "Sentinel Rotation"],
        environmentalResponse: "Tunnels include sophisticated passive ventilation systems using Bernoulli's principle across mounds."
      },
      {
        phase: "Syntactic Alarm Sentinel & Coterie Defense",
        timeframe: "2 - 5+ Years",
        behavior: "Adults take turns standing sentinel on elevated mounds. They possess the most sophisticated animal language decoded in nature: chirps encode predator species, shape, size, color of clothing, and speed of approach. Successful escapes are marked by infectious 'jump-yip' waves.",
        keyActivities: ["Semantic Alarm Broadcasting", "Jump-Yip Wave Transmission", "Territory Clipped Grass Clearing"],
        environmentalResponse: "Actively clips tall prairie grasses around burrows to ensure unobstructed visual sightlines."
      }
    ],
    biochemicalDrivers: [
      {
        chemicalAgent: "Epinephrine-Driven Syntactic Alarm Broadcast",
        molecularClass: "Catecholamine & Auditory Neuromodulator",
        sourceOrgan: "Adrenal Medulla & Laryngeal Motor Cortex",
        triggerContext: "Visual identification of predator (human, coyote, golden eagle, badger) approaching coterie.",
        chemicalMechanism: "Visual cortex registers predator features -> instantaneous sympathoadrenal discharge releases epinephrine -> fires auditory-motor circuits in the brainstem -> coordinates rapid frequency-modulated multi-harmonic acoustic chirps.",
        behavioralTransformation: "Generates precise semantic vocalizations: e.g., 'tall human in blue shirt moving fast' triggers running to burrows and standing at entrances; 'dive-bombing eagle' triggers instant blind subterranean diving.",
        icon: "⚡"
      },
      {
        chemicalAgent: "Oxytocin Contagious 'Jump-Yip' Wave",
        molecularClass: "Hypothalamic Social Nonapeptide",
        sourceOrgan: "Paraventricular Nucleus (PVN)",
        triggerContext: "Predator departure or safe all-clear signal across the coterie.",
        chemicalMechanism: "Seeing a neighboring sentinel leap vertically and emit a two-part 'jump-yip' triggers mirror neurons -> releases oxytocin into the striatum -> lowers acute cortisol.",
        behavioralTransformation: "Induces an infectious behavioral wave: dozens of prairie dogs across the colony sequentially leap onto their hind legs, throw forearms into the air, and yip in joyous relief, relaxing collective vigilance.",
        icon: "🧬"
      }
    ]
  }
};

/**
 * Merge comprehensive ethology and neuroendocrinology datasets into species objects
 * @param {Array} speciesList Array of catalog species records
 * @returns {Array} Enriched species array
 */
export function enrichSpeciesWithEthology(speciesList) {
  if (!speciesList) return [];
  return speciesList.map(species => {
    const extra = ETHOLOGY_AND_BIOCHEM_CATALOG[species.id];
    if (extra) {
      return {
        ...species,
        lifeStagesAndBehavior: extra.lifeStagesAndBehavior,
        biochemicalDrivers: extra.biochemicalDrivers
      };
    }
    return species;
  });
}
