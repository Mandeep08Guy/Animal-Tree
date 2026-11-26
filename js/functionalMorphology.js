/**
 * TerraFauna // Functional Morphology, Predatory Tactics & Skeletal Biomechanics Knowledge Base
 * Authentic, peer-reviewed comparative osteology, predatory ethology, and dietary niche specialization
 * across TerraFauna catalog species, grounded in biomechanics, functional morphology, and evolutionary ecology.
 */

export const FUNCTIONAL_MORPHOLOGY_CATALOG = {
  "panthera-leo": {
    huntingStrategy: {
      tacticalMethod: "Crepuscular / Nocturnal Coordinated Group Ambush",
      executionSteps: "1. Stalking reconnaissance utilizing darkness and tall grass cover. 2. Lionesses fan out into flanking wings to channel ungulates toward central concealed ambushers. 3. Explosive sprint (up to 60 km/h) over final 30 meters. 4. Forepaw hook takedown using protractile dewclaws to unbalance hindquarters. 5. Fatal clamped strangulation bite across trachea or over muzzle.",
      primaryPrey: ["Blue Wildebeest (Connochaetes taurinus)", "Plains Zebra (Equus quagga)", "African Buffalo (Syncerus caffer)"],
      preySpecializationRationale: "Large body mass (150 - 800 kg) provides high caloric density (5-7 kg meat/day per adult) required to sustain entire social prides. Smaller prey (rodents, hares) yield a net negative energy return compared to the energetic cost of pride stalking, while fully grown megaherbivores (adult elephants, rhinos) carry unacceptable injury risks.",
      trophicGuild: "Apex Carnivore (Hypercarnivore >70% meat)"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Heavily mineralized, muscularly anchored skeleton optimized for explosive wrestling force and sudden acceleration over long-distance running.",
      boneAdaptations: [
        {
          boneName: "Vestigial Free-Floating Clavicle",
          geometricDesign: "Reduced to a small curved bone embedded purely in pectoral musculature without articulating with the scapula or sternum.",
          survivalUtility: "Allows the entire shoulder girdle and scapula to slide freely along the lateral ribcage, extending forward stride length and absorbing monumental shock when tackling 500 kg running buffalo without risk of collarbone fracture."
        },
        {
          boneName: "Massive Humerus with Expanded Deltopectoral Crest",
          geometricDesign: "Thick cortical bone with broad, rugose crests providing massive surface area for teres major and pectoralis muscles.",
          survivalUtility: "Generates immense downward grappling torque, allowing lions to physically drag down galloping ungulates by hooking into the rump."
        },
        {
          boneName: "Interlocking Lumbar Zygapophyses",
          geometricDesign: "Vertebral articular facets curve tightly around each other in deep interlocking joints.",
          survivalUtility: "Prevents axial spinal twisting and vertebral dislocation when wrestling violently thrashing prey."
        },
        {
          boneName: "Flared Zygomatic Arches & High Sagittal Crest",
          geometricDesign: "Cheekbones flare broadly outward to create immense temporal fenestra openings.",
          survivalUtility: "Accommodates massive temporalis and masseter muscle volume, generating a 4,000 N bite force needed to clamp and crush thick ungulate windpipes."
        }
      ]
    }
  },

  "loxodonta-africana": {
    huntingStrategy: {
      tacticalMethod: "Megaherbivore Bulk Harvesting & Destructive Browsing",
      executionSteps: "1. 40,000-muscle prehensile proboscis (trunk) strips high acacia branches, foliage, and shoots. 2. Massive tusks chisel nutrient-dense cambium bark from baobab and acacia trunks. 3. Whole-body leverage pushes down mature trees (up to 30 cm diameter) to access high-canopy leaves. 4. Foot and trunk excavation of mineral-rich soil and subterranean roots.",
      primaryPrey: ["Acacia Foliage", "Tree Bark & Cambium", "Savannah Grasses (Themeda triandra)", "Subterranean Roots & Tubers"],
      preySpecializationRationale: "Hindgut caeco-colic fermentation strategy requires continuous high-volume intake (150 - 200 kg daily) of fibrous, low-nutrient biomass. Elephants bypass the toxic secondary chemical defenses of woody plants through sheer digestive bulk transit (40-50% efficiency), exploiting coarse vegetation that would poison smaller ruminants.",
      trophicGuild: "Megaherbivore Keystone Browser / Grazer"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Columnar graviportal skeleton designed to support 6,000 kg of compressive body mass with minimal muscular strain.",
      boneAdaptations: [
        {
          boneName: "Columnar Graviportal Limb Bones (Femur & Humerus)",
          geometricDesign: "Limb bones are nearly vertical, stacked like stone pillars directly beneath the center of gravity with minimal joint angle flexion.",
          survivalUtility: "Eliminates shearing/bending stresses on bone shafts; body weight is supported by direct compressive bone force, enabling adult elephants to stand for days with virtually zero muscular fatigue."
        },
        {
          boneName: "Pneumatized Honeycomb Cranial Bones",
          geometricDesign: "Cranium is filled with extensive air-filled sinus chambers separated by thin structural trabeculae.",
          survivalUtility: "Dramatically expands cranial surface area for anchoring massive neck muscles and heavy ivory tusks while keeping the head lightweight enough to balance on the atlas vertebra."
        },
        {
          boneName: "Lophodont Hypsodont Molars",
          geometricDesign: "Six horizontal molar sets across lifespan with alternating plates of hard enamel and softer dentine that wear into washboard ridges.",
          survivalUtility: "Grinds tough silica-rich grasses and woody tree bark; teeth migrate forward horizontally, replacing worn anterior plates across a 60-year lifespan."
        },
        {
          boneName: "Subpodial Prepollex & Prehallux (Skeletal Cartilage Rods)",
          geometricDesign: "Sixth 'false digit' of fibrocartilage embedded beneath the plantar fat pad.",
          survivalUtility: "Acts as a shock-absorbing hydraulic spring and distributes weight across foot pads, dampening impact and focusing low-frequency seismic ground vibrations."
        }
      ]
    }
  },

  "physeter-macrocephalus": {
    huntingStrategy: {
      tacticalMethod: "Bathypelagic Biosonar Echolocation & Negative-Pressure Suction",
      executionSteps: "1. 45-to-90 minute deep dive into aphotic mesopelagic zone (1,000 - 2,500 m). 2. Emits directional clicks (>230 dB) to scan dark water column. 3. Shifts to high-cadence creak buzz when closing within 10 m of squid. 4. Rapid oropharyngeal cavity expansion generates negative pressure, engulfing cephalopods without mastication.",
      primaryPrey: ["Giant Squid (Architeuthis dux)", "Colossal Squid (Mesonychoteuthis hamiltoni)", "Bioluminescent Glass Squids (Histioteuthidae)", "Benthic Skates & Grenadiers"],
      preySpecializationRationale: "50-ton body mass requires immense caloric density. Cephalopods aggregate in deep oxygen minimum layers where virtually no other apex predators can hunt. Their gelatinous muscular bodies provide pure protein and lipids with zero indigestible bone waste.",
      trophicGuild: "Bathypelagic Apex Teuthophage / Macropredator"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Highly modified asymmetric marine cranium and lipid-impregnated bones structured to withstand 200+ atmospheres of hydrostatic pressure.",
      boneAdaptations: [
        {
          boneName: "Asymmetrical Cranial Basin (Amphitheater Skull)",
          geometricDesign: "Dorsal cranial surface forms a gigantic, left-skewed parabolic bony trough.",
          survivalUtility: "Functions as a giant acoustic reflector, cradling the 2,000-liter spermaceti organ and junk tissue to collimate and direct ultra-intense biosonar clicks forward into the abyss."
        },
        {
          boneName: "Narrow, Elongated Mandible Fitting into Edentulous Maxillary Pockets",
          geometricDesign: "Slender lower jaw with 20-26 pairs of conical ivory teeth that slot into toothless maxillary gum sockets.",
          survivalUtility: "Reduces drag to near zero when snapping shut against high deep-sea water resistance; serves as a grasping clamp while suction pulls squid inward."
        },
        {
          boneName: "Fused Cervical Vertebrae (Synostosis Block)",
          geometricDesign: "Six of the seven cervical vertebrae are fused into a single monolithic bony block.",
          survivalUtility: "Prevents neck whiplash or axial dislocation during 50-ton deep-water accelerations and battles with thrashing giant squid."
        },
        {
          boneName: "Lipid-Saturated Non-Compressible Bone Matrix",
          geometricDesign: "Bone osteons are filled with heavy biological fats rather than air cavities.",
          survivalUtility: "Prevents bone crushing and nitrogen embolisms under crushing 250 atm hydrostatic pressure at 2,500 meters depth."
        }
      ]
    }
  },

  "megaptera-novaeangliae": {
    huntingStrategy: {
      tacticalMethod: "Cooperative Bubble-Netting & Expansive Rorqual Lunge",
      executionSteps: "1. Pod locates bait schools via passive listening and echo-ranging. 2. Diver whales circle beneath, blowing controlled bubble streams that rise to form a confining cylindrical net. 3. Vocalizer whale emits high-decibel groans to herd fish tightly together. 4. Whales accelerate vertically through center with jaws open at 90°, engulfing up to 15,000 liters of water and fish. 5. Tongue pushes water through baleen filters.",
      primaryPrey: ["Antarctic & Northern Krill (Euphausia superba)", "Capelin (Mallotus villosus)", "Atlantic Herring (Clupea harengus)", "Sand Lance (Ammodytes)"],
      preySpecializationRationale: "Total lack of teeth and reliance on 270-400 fringed keratin baleen plates restricts diet to small schooling organisms (0.5 - 15 cm). Larger fish would tear baleen bristles or choke narrow esophagus. Swallowing massive swarms delivers up to 2,000 kg of lipid-rich biomass daily.",
      trophicGuild: "Pelagic Filter Feeder / Rorqual Mysticete"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Flexible kinetic skull and elongated hydrofoil pectoral appendages engineered for monumental volumetric throat expansion and tight sub-surface turns.",
      boneAdaptations: [
        {
          boneName: "Elastic Unfused Mandibular Symphysis",
          geometricDesign: "Left and right lower jaw bones are joined by an elastic fibrocartilaginous ligament containing a specialized mechanoreceptive sensory organ.",
          survivalUtility: "Allows the jaw bones to rotate outward by 90° on their long axes during a lunge, doubling the oral cavity volume to engulf a water mass exceeding the whale's own body weight."
        },
        {
          boneName: "Hyper-Elongated Pectoral Limbs with Leading-Edge Tubercles",
          geometricDesign: "Flippers are one-third of total body length (up to 5 m), featuring rounded bony nodules (tubercles) along the anterior margin.",
          survivalUtility: "Induces hydrodynamic vortices that delay boundary-layer stall at steep banking angles, giving this 30-ton animal unmatched agility to spin and circle inside bubble nets."
        },
        {
          boneName: "Arched Maxillary Rostrum Canopy",
          geometricDesign: "Upper jaw forms an elevated, broad bony arch supporting hundreds of hanging baleen plates.",
          survivalUtility: "Withstands monumental upward hydrodynamic pressure as the tongue pushes thousands of gallons of water out through the baleen sieves."
        }
      ]
    }
  },

  "orcinus-orca": {
    huntingStrategy: {
      tacticalMethod: "Coordinated Matrilineal Pack Tactics & Acoustic Carousel Herding",
      executionSteps: "1. Matriarch plans tactical approach based on prey type. 2. For pinnipeds on ice: 3-5 orcas swim abreast to generate a hydraulic wave that washes seals off floes. 3. For pelagic fish: carousel swimming herds fish into balls, followed by 10,000 N tail-slap concussions. 4. For large whales: relay chases exhaust mother-calf pairs until calf is drowned by collective body pressure.",
      primaryPrey: ["Chinook Salmon (Resident ecotype)", "Harbor Seals & Sea Lions (Transient ecotype)", "Minke Whales & Porpoises (Bigg's ecotype)"],
      preySpecializationRationale: "Strict cultural transmission. Resident pods hunt fatty Chinook Salmon because their tooth spacing and digestive tract are co-evolved for soft fish flesh. Mammal-eating transients hunt seals and whales because high-fat blubber meets elevated caloric needs in cold sub-polar waters, while stealth silence avoids seal acoustic detection.",
      trophicGuild: "Apex Marine Predator (Cultural Ecotype Specialist)"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Heavy, compact, hydrodynamic skeleton engineered for high-velocity blunt-force ramming and rotational prey tearing.",
      boneAdaptations: [
        {
          boneName: "Interlocking Conical Thecodont Teeth in Thick Mandibles",
          geometricDesign: "40-56 stout, backward-curved teeth deeply embedded in reinforced bony alveolar sockets.",
          survivalUtility: "Interlocks like a bear trap when closed; prevents tooth shearing when violently thrashing and tearing tough blubber from marine mammals."
        },
        {
          boneName: "Fused Anterior Cervical Vertebrae (Rigid Neck Axis)",
          geometricDesign: "First 3-4 neck vertebrae are fused into a solid calcified mass.",
          survivalUtility: "Prevents cervical compression and whiplash injury when ramming large sharks, sea lions, or 20-ton baleen whales at 55 km/h."
        },
        {
          boneName: "Broad Paddle-Like Scapula with Heavy Acromion",
          geometricDesign: "Scapula is fan-shaped and heavily ossified with deep muscular anchoring grooves.",
          survivalUtility: "Anchors immense deltoid and pectoral muscles, enabling instantaneous lateral steering and high-speed directional changes."
        },
        {
          boneName: "Reinforced Spheroidal Cranial Vault",
          geometricDesign: "Frontal and occipital cranial bones are extraordinarily thick and impact-resistant.",
          survivalUtility: "Acts as a biological battering ram to deliver fatal blunt-force trauma to prey without fracturing braincase bones."
        }
      ]
    }
  },

  "pan-troglodytes": {
    huntingStrategy: {
      tacticalMethod: "Arboreal Male Driver-Ambusher Coordination & Terrestrial Stalking",
      executionSteps: "1. Male hunting party identifies Red Colobus monkey troop in high canopy. 2. 'Drivers' chase monkeys along predetermined tree pathways. 3. 'Blockers' climb adjacent trees to prevent escape into secondary canopy. 4. 'Ambushers' wait concealed, leaping forward to grab fleeing monkeys mid-air. 5. Prey is bludgeoned or dismembered by manual strength.",
      primaryPrey: ["Western Red Colobus (Piliocolobus badius)", "Bushbuck Fawns (Tragelaphus scriptus)", "Wild Fig Fruits (Ficus)", "Termites & Driver Ants"],
      preySpecializationRationale: "Colobus monkeys inhabit predictable canopy strata and lack dangerous defense weaponry. Fresh meat provides critical micronutrients (heme iron, vitamin B12, essential fatty acids) and acts as social currency for males to cement political alliances and mating privileges. High-fructose canopy fruits supply carbohydrates for energetic climbing.",
      trophicGuild: "Omnivore / Opportunistic Carnivore & Frugivore"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Suspensory arboreal skeleton with high tensile limb strength and robust cranial bone struts for crushing and climbing.",
      boneAdaptations: [
        {
          boneName: "Elongated Curved Phalanges with Deep Flexor Grooves",
          geometricDesign: "Finger and toe bones are curved with prominent tubercles for flexor digitorum tendons.",
          survivalUtility: "Forms a natural hook with enormous tensile holding capacity, allowing chimps to hang one-handed while reaching to snatch monkeys out of the air."
        },
        {
          boneName: "Full-Rotation Ball-and-Socket Shoulder Joint (Glenohumeral)",
          geometricDesign: "Glenoid cavity faces cranially and laterally with extensive articular surface area.",
          survivalUtility: "Enables 360° brachiation and arm swinging, and allows chimps to throw heavy stones or sticks with lethal velocity."
        },
        {
          boneName: "Prominent Supraorbital Torus & Heavy Facial Struts",
          geometricDesign: "Thick bar of bone over eye orbits connecting to reinforced zygomatic arches.",
          survivalUtility: "Dissipates monumental compressive bite stress across the skull when puncturing monkey skulls with 3-cm canines or cracking hard seeds."
        },
        {
          boneName: "Broad Iliac Pelvic Blades",
          geometricDesign: "Pelvis is flared laterally to anchor powerful gluteal and thigh adductor muscles.",
          survivalUtility: "Provides powerful hip torque for vertical trunk climbing and explosive leaps across wide canopy gaps."
        }
      ]
    }
  },

  "canis-lupus": {
    huntingStrategy: {
      tacticalMethod: "Cooperative Cursorial Exhaustion & Vulnerability Testing",
      executionSteps: "1. Olfactory tracking of herd over tens of kilometers. 2. Approaching herd to trigger flight response and identify weak, aged, or young animals. 3. Relay endurance pursuit over 2 - 10 km at 45 km/h. 4. Flanking pack members harry sides to keep prey on course. 5. Takedown by clamping hindquarters/rump, followed by fatal throat clamp.",
      primaryPrey: ["Elk / Wapiti (Cervus canadensis)", "Moose (Alces alces)", "White-Tailed & Mule Deer (Odocoileus)", "Bison (Bison bison)"],
      preySpecializationRationale: "High pack energy expenditure requires large ungulate prey yielding 50 - 200 kg of meat to feed 8-15 individuals. Catching small rodents cannot sustain pack social cohesion. Wolves target aged, arthritic, or calf ungulates to minimize risk of fractured jaws from defensive kicks.",
      trophicGuild: "Pack Apex Carnivore (Cursor / Hypercarnivore)"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Cursorial endurance skeleton built for energy-efficient sagittal running and high-impact bone-cracking jaw leverage.",
      boneAdaptations: [
        {
          boneName: "Digitigrade Metapodial Spring Architecture",
          geometricDesign: "Elongated metacarpal and metatarsal bones bound tightly by tough elastic ligaments.",
          survivalUtility: "Acts as an additional springy leg segment that lengthens running stride and stores elastic strain energy, dramatically cutting caloric cost during 50-km pursuits."
        },
        {
          boneName: "Laterally Compressed Deep Thoracic Cage",
          geometricDesign: "Rib cage is narrow side-to-side and deep dorsoventrally.",
          survivalUtility: "Allows forelimbs to swing in a straight forward-backward plane without wasted lateral wobbling, and accommodates large aerobic lungs and heart."
        },
        {
          boneName: "Hypertrophied Sectorial Carnassials (P4/M1)",
          geometricDesign: "Upper fourth premolar and lower first molar have razor-sharp shearing blades aligned with heavy temporalis leverage.",
          survivalUtility: "Generates over 1,200 N of cutting force to slice through tough ungulate muscle and crack open dense leg bones for marrow access in winter."
        },
        {
          boneName: "Locked Radio-Ulnar Syndesmosis",
          geometricDesign: "Radius and ulna bones of the foreleg are tightly appressed and incapable of pronation/supination.",
          survivalUtility: "Prevents rotational leg twisting or sprains when sprinting at 50 km/h across rocky terrain or frozen snowdrifts."
        }
      ]
    }
  },

  "dacelo-novaeguineae": {
    huntingStrategy: {
      tacticalMethod: "Sit-and-Wait Perch Ambush & High-Impact Bashing",
      executionSteps: "1. Motionless surveillance from an elevated branch (3 - 10 m). 2. Binocular triangulation of ground movement. 3. Silent downward dive pounce, seizing prey behind head with heavy beak. 4. Return to high perch or rock. 5. Repeatedly bashes prey against branch to break bones, crush venom glands, and tenderize carcass. 6. Swallowed whole.",
      primaryPrey: ["Venomous Elapid Snakes (Tiger Snake, Brown Snake)", "Blue-Tongued Skinks (Tiliqua)", "Freshwater Crayfish (Yabbies)", "Small Rodents & Centipedes"],
      preySpecializationRationale: "Perch-and-pounce hunting exploits high-contrast ground prey. Venomous snakes and large lizards provide dense, long muscular protein packages that cannot easily run once pinned behind the neck. Bashing behavior mechanically neutralizes venom sacks before ingestion.",
      trophicGuild: "Carnivorous Perch-and-Pounce Avian Predator"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Heavy-duty impact-resistant cranial hammerhead and reinforced cervical column capable of withstanding repetitive high-G bashing.",
      boneAdaptations: [
        {
          boneName: "Hyper-Ossified Heavy Chisel Mandible & Maxilla",
          geometricDesign: "Bill bones are deep dorsoventrally with thick internal trabecular struts encased in tough keratin.",
          survivalUtility: "Functions as a biological sledgehammer; withstands hundreds of violent impacts against solid wooden branches and rocks without chipping or micro-fracturing."
        },
        {
          boneName: "Fused Cranial Kinetic Joints & Sclerotic Ring",
          geometricDesign: "Normal avian cranial kinetic flexure joints are fused into a rigid solid bone case, with overlapping bony eye plates.",
          survivalUtility: "Dissipates violent shockwaves across the entire skull, preventing brain concussions and retinal detachment when violently bashing prey."
        },
        {
          boneName: "Shortened Hypertrophied Cervical Vertebrae",
          geometricDesign: "Neck vertebrae are broad and squat with enlarged muscle attachment crests.",
          survivalUtility: "Anchors powerful lateral whiplash neck muscles (longus colli) that generate the centrifugal torque required to snap a snake's spine."
        },
        {
          boneName: "Fused Synsacral Pelvic Shield",
          geometricDesign: "Lower spine and pelvis are fused into a wide, rigid bony plate.",
          survivalUtility: "Absorbs downward kinetic impact when diving at full speed onto hard, dry Australian red clay soil."
        }
      ]
    }
  },

  "crocuta-crocuta": {
    huntingStrategy: {
      tacticalMethod: "Endurance Pack Cursorial Swarm & Total Skeleton Consumption",
      executionSteps: "1. Clan members assemble at dusk with social greeting ceremonies. 2. Group pursuit across open savannah at 60 km/h over 3 - 5 km. 3. Swarm encirclement targeting abdominal walls, flanks, and hamstring tendons. 4. Rapid disembowelment and consumption of entire carcass (meat, skin, hooves, and bone) in under 15 minutes.",
      primaryPrey: ["Blue Wildebeest (Connochaetes taurinus)", "Plains Zebra", "Thomson's Gazelle", "Discarded Large Ungulate Skeletons (Scavenged)"],
      preySpecializationRationale: "Possesses specialized gastric acid (pH 1.0) capable of dissolving dense bone minerals and animal hooves. Eating whole skeletons allows hyenas to extract 100% of organic biomass, surviving in harsh habitats where other carnivores starve after muscle meat is depleted.",
      trophicGuild: "Apex Hunter-Scavenger / Osteophage (Bone Consumer)"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Mammoth cranial bone-cracking machinery and sloping asymmetrical torso built for carrying heavy bone fragments.",
      boneAdaptations: [
        {
          boneName: "Massive Sagittal Crest & Expanded Zygomatic Arches",
          geometricDesign: "Vertical fin of bone along skull apex reaches 4 cm height, with widely bowed cheekbones.",
          survivalUtility: "Anchors monumental temporalis and masseter muscles generating 9,000 N of bite force—more than enough to shatter adult giraffe and hippo femurs."
        },
        {
          boneName: "Domed Premolars with Interlocking Hunter-Schreger Enamel",
          geometricDesign: "Third upper and lower premolars are shaped like rounded mountain peaks with zigzag microscopic enamel prisms.",
          survivalUtility: "Prevents tooth cracking when crushing dense dry bones under thousands of Newtons of pressure."
        },
        {
          boneName: "Sloping High-Shoulder Thoracic Skeleton",
          geometricDesign: "Forelimbs and thoracic vertebrae are substantially longer and more elevated than hindquarters.",
          survivalUtility: "Shifts the center of gravity over the shock-absorbing front limbs, reducing spinal torque when running with 15-kg bone chunks back to the clan den."
        },
        {
          boneName: "Heavy Cervical-Thoracic Neural Spines",
          geometricDesign: "Tall, backward-slanted neural spines on anterior thoracic vertebrae.",
          survivalUtility: "Anchors immense nuchal ligaments and neck muscles, allowing hyenas to lift and drag carcasses equal to their own body weight."
        }
      ]
    }
  },

  "magicicada-septendecim": {
    huntingStrategy: {
      tacticalMethod: "Subterranean Xylem Tapping & Mass Emergence Satiation",
      executionSteps: "1. 17-year subterranean nymph cycle: uses fossorial forelimbs to tunnel through clay soil. 2. Inserts piercing-sucking stylet into deciduous tree root xylem vessels. 3. Continuously extracts dilute water and minerals over 17 years. 4. Synchronized mass emergence of billions overwhelms all localized predators.",
      primaryPrey: ["Root Xylem Fluid of Hardwood Trees (Oak, Maple, Hickory)", "Deciduous Twig Sap (Adults)"],
      preySpecializationRationale: "Root xylem fluid is dilute (99.9% water and dissolved minerals, near-zero sugars). By feeding on xylem instead of sugary phloem, cicadas avoid osmotic stress and direct competition with other insects. The 17-year cycle is an evolutionary developmental adaptation to grow on this hyper-dilute nutrient source.",
      trophicGuild: "Subterranean Xylophage / Sucking Herbivore"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Chitinous cuticular exoskeleton featuring fossorial digging modifications and resonant acoustic air chambers.",
      boneAdaptations: [
        {
          boneName: "Modified Fossorial Foreleg Femur & Tibia",
          geometricDesign: "Exoskeletal foreleg femur is heavily thickened with sharp cuticular denticles and an interlocking tibial spur.",
          survivalUtility: "Acts as a biological excavator, shearing through compacted clay soil and tree roots without risk of cuticular collapse."
        },
        {
          boneName: "Elastic Resilin-Linked Abdominal Tymbal Organ",
          geometricDesign: "Cuticular abdominal membrane composed of alternating rigid chitin ribs and elastic resilin proteins.",
          survivalUtility: "Deforms at 120-180 Hz when pulled by internal muscles, clicking and buckling to create an acoustic wall (>100 dB) that saturates avian predator hearing."
        },
        {
          boneName: "Internal Chitinous Sucking Piston (Cibarial Pump Apodeme)",
          geometricDesign: "Rigid internal skull plate anchored to massive dilator muscle bundles.",
          survivalUtility: "Generates extreme negative hydrostatic pressure needed to draw sap out of high-tension negative-pressure tree xylem vessels."
        }
      ]
    }
  },

  "acinonyx-jubatus": {
    huntingStrategy: {
      tacticalMethod: "High-Acceleration Diurnal Stalk & Cursorial Sprint",
      executionSteps: "1. Daytime visual scan from termite mounds. 2. Stalk through grass cover to within 60 - 100 meters. 3. Explosive sprint from 0 to 100 km/h in 3.0 seconds (top speed 112 km/h). 4. Use sharp dewclaw to trip fleeing ungulate's hind leg mid-stride. 5. Deliver suffocation clamp across trachea.",
      primaryPrey: ["Thomson's Gazelle (Eudorcas thomsonii)", "Springbok (Antidorcas marsupialis)", "Impala (Aepyceros melampus)", "Hare & Young Warthog"],
      preySpecializationRationale: "Lightweight gracile skeleton prevents tackling dangerous heavy prey (zebra, buffalo) which would shatter the cheetah's thin bones. Diet is specialized on swift, agile ungulates that no other predator on Earth can catch in an open pursuit.",
      trophicGuild: "Specialized High-Velocity Cursorial Carnivore"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Ultra-lightweight aerodynamic skeleton designed as an elastic spring for maximum stride length and extreme velocity.",
      boneAdaptations: [
        {
          boneName: "Hyper-Flexible Lumbar Vertebral Spring",
          geometricDesign: "Lumbar vertebrae are elongated with thick intervertebral discs capable of extreme flexion and extension.",
          survivalUtility: "Acts like a giant biological spring, curling and extending to add nearly 1 meter to every stride, yielding a stride length of 7.5 meters at full sprint."
        },
        {
          boneName: "Semi-Retractile Claws with Rigid Digital Ligaments",
          geometricDesign: "Claws lack full protective skin sheaths; held semi-extended with thick plantar ligaments.",
          survivalUtility: "Functions like athletic track cleats, providing non-slip traction and high-G grip during 90-degree turns at 90 km/h."
        },
        {
          boneName: "Long Caudal Vertebral Rudder (Tail Counterbalance)",
          geometricDesign: "Elongated tail vertebrae with dense muscular lateral anchors.",
          survivalUtility: "Swings laterally in mid-air to counteract centrifugal force, preventing the cheetah from rolling over during sudden high-speed turns."
        },
        {
          boneName: "Streamlined Thin-Walled Skull with Expanded Nasal Cavity",
          geometricDesign: "Small, rounded cranium with enlarged internal nasal turbinates.",
          survivalUtility: "Maximizes oxygen delivery to lungs while holding prey in a suffocating clamp, without adding unnecessary aerodynamic drag or head weight."
        }
      ]
    }
  },

  "ambystoma-mexicanum": {
    huntingStrategy: {
      tacticalMethod: "Benthic Sit-and-Wait Vacuum Suction Strike",
      executionSteps: "1. Motionless crypsis on muddy freshwater lake bottom. 2. Hydrodynamic wave detection via lateral line neuromasts. 3. Rapid depression of hyoid apparatus in under 15 milliseconds. 4. Negative hydrostatic pressure sucks prey and water into oral cavity. 5. Water expelled through gill slits while prey is retained by vomerine teeth.",
      primaryPrey: ["Tubifex & Blackworms (Lumbriculus variegatus)", "Freshwater Cladocera (Daphnia magna)", "Freshwater Amphipods", "Small Insect Larvae"],
      preySpecializationRationale: "Neotenic larval morphology retains cartilaginous jaw structures and lacks functional chewing teeth; cannot dismember or chew tough prey. Suction feeding is mechanically optimized for soft-bodied benthic invertebrates.",
      trophicGuild: "Benthic Suction Carnivore / Invertivore"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Paedomorphic cartilaginous chondrocranium and flexible notochordal spine engineered for instantaneous vacuum expansion.",
      boneAdaptations: [
        {
          boneName: "Persistent Cartilaginous Chondrocranium",
          geometricDesign: "Skull is composed largely of flexible cartilage rather than heavy fused dermal bones.",
          survivalUtility: "Provides lightweight elasticity, allowing the mouth and throat to rapidly billow outward in 15 milliseconds without mineralized joint resistance."
        },
        {
          boneName: "Hypertrophied Ceratohyal Cartilage Lever",
          geometricDesign: "Enlarged triangular cartilage plates beneath the floor of the mouth.",
          survivalUtility: "Pivots downward like an opening bellows when pulled by sternohyoideus muscles, dropping oral pressure by multiple atmospheres to suck in prey."
        },
        {
          boneName: "Vestigial Conical Vomerine Tooth Bands",
          geometricDesign: "Small, backward-angled needle teeth anchored along the vomer and palatine bones.",
          survivalUtility: "Prevents squirming aquatic worms from slipping backward out of the mouth as excess water is expelled through external gill slits."
        },
        {
          boneName: "Unfused Notochordal Vertebrae",
          geometricDesign: "Vertebral column retains a continuous central core of notochord cartilage.",
          survivalUtility: "Provides continuous lateral elasticity for sudden c-start escape swimming bursts when avoiding predatory herons."
        }
      ]
    }
  },

  "varanus-komodoensis": {
    huntingStrategy: {
      tacticalMethod: "Ambush Sawing Laceration & Anticoagulant Venom Induction",
      executionSteps: "1. Concealed camouflage ambush along dense game trails. 2. Explosive short-distance lunge targeting legs or abdomen. 3. Sawing bite-and-pull tear delivering serrated tooth lacerations. 4. Secretion of hypotensive anticoagulant venom from mandibular glands. 5. Vomeronasal scent tracking of collapsed prey over kilometers.",
      primaryPrey: ["Javan Rusa Deer (Rusa timorensis)", "Wild Boar (Sus scrofa)", "Water Buffalo (Bubalus bubalis)", "Timor Deer"],
      preySpecializationRationale: "Massive 80-kg body size requires large vertebrate prey. Island gigantism made Komodo dragons the sole apex terrestrial predator in their ecosystem; large ungulates provide the only biomass sufficient to maintain adult metabolic fitness.",
      trophicGuild: "Apex Terrestrial Carnivore / Venomous Macropredator"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Kinetic streptostylic skull with dinosaur-like ziphodont dentition and dermal osteoderm internal chainmail armor.",
      boneAdaptations: [
        {
          boneName: "Four-Hinged Kinetic Streptostylic Skull",
          geometricDesign: "Skull possesses mobile joints between the braincase, upper jaw, and quadrate bone.",
          survivalUtility: "Allows upper jaw to flex upward and lower jaws to bow outward, enabling dragons to swallow intact deer carcasses and limbs up to 80% of their body weight."
        },
        {
          boneName: "Ziphodont Serrated Teeth with Deep Recurvature",
          geometricDesign: "Laterally compressed, curved backward with fine serrations along anterior and posterior enamel margins (identical to theropod dinosaurs).",
          survivalUtility: "Slices through thick, tough ungulate hide with minimal downward pressure, tearing open deep lacerations that allow venom to penetrate vascular tissue."
        },
        {
          boneName: "Unfused Mandibular Symphysis with Elastic Ligament",
          geometricDesign: "The left and right lower jaw bones are not fused by bone at the chin.",
          survivalUtility: "Enables the lower jaws to separate and stretch around enormous food boluses during whole-carcass ingestion."
        },
        {
          boneName: "Dermal Bone Osteoderm Mesh (Skin Armor)",
          geometricDesign: "Thousands of tiny, mineralized bony nodules embedded directly within the dermis of adult skin.",
          survivalUtility: "Functions as flexible biological chainmail, protecting adult dragons from lethal bites during aggressive mating combats with rival males."
        }
      ]
    }
  },

  "ornithorhynchus-anatinus": {
    huntingStrategy: {
      tacticalMethod: "Benthic Submerged Electro-Mechanosensory Sweeping",
      executionSteps: "1. Submerges with eyes, ears, and nostrils closed by muscular skin folds. 2. Lateral bill sweep (2-3 Hz) across stream substrate. 3. 40,000 electroreceptive pits detect prey muscle micro-currents (20 µV/cm); 60,000 mechanoreceptors detect water displacement. 4. Scoops prey and gravel into cheek pouches. 5. Surfaces to grind food.",
      primaryPrey: ["Freshwater Crayfish / Yabbies (Cherax destructor)", "Caddisfly Larvae (Trichoptera)", "Dragonfly Nymphs", "Freshwater Shrimp (Paratya)"],
      preySpecializationRationale: "Adults are entirely toothless (edentulous) and possess an agastric digestive tract (no acid-producing stomach; esophagus connects directly to intestine). They cannot digest tough vertebrate prey or cellulose plants, so they specialize strictly on soft benthic macroinvertebrates ground between keratin plates.",
      trophicGuild: "Benthic Electroreceptive Carnivore / Invertivore"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Monotreme skeleton combining primitive reptilian pectoral girdles with electroreceptive bill scaffolds and burrow-digging levers.",
      boneAdaptations: [
        {
          boneName: "Forked Premaxillary Bill Scaffold",
          geometricDesign: "Premaxillae branch into widely diverging, flattened dumbbell-shaped rostral rods.",
          survivalUtility: "Creates a light, flexible bony frame that supports the 100,000 sensory electro- and mechanoreceptive nerve pits across the bill."
        },
        {
          boneName: "Ancestral Interclavicle & Coracoid Pectoral Girdle",
          geometricDesign: "Retains ancestral synapsid bones (interclavicle, procoracoid, and coracoid) locking the shoulder girdle to the sternum.",
          survivalUtility: "Provides extraordinary transverse leverage for the forelegs, allowing the platypus to dig complex 30-meter riverbank burrows through dense clay."
        },
        {
          boneName: "Paired Epipubic Pelvic Bones",
          geometricDesign: "Two forward-projecting bones extending from the anterior pubic rim into the abdominal wall.",
          survivalUtility: "Supports the ventral abdominal wall during swimming and stabilizes the pelvis during rapid burrow digging."
        },
        {
          boneName: "Cornified Keratinous Masticatory Pad Platforms",
          geometricDesign: "Hardened, ridged keratin plates sitting in shallow bony dentary depressions (replaces shed juvenile teeth).",
          survivalUtility: "Grinds tough chitinous crayfish shells against ingested riverbed gravel without needing fragile calcified teeth."
        }
      ]
    }
  },

  "tursiops-truncatus": {
    huntingStrategy: {
      tacticalMethod: "Cooperative Mud-Plume Corraling & Hydrodynamic Fish Whacking",
      executionSteps: "1. Pod tracks coastal fish schools using high-frequency biosonar. 2. Driver dolphin circles school in shallow water, beating tail to stir up dense circular mud walls. 3. Trapped fish leap over the mud ring to escape. 4. Stationed dolphins catch fish mid-air or surface-skim them. 5. Tail-slaps launch fish 5 m into air to stun them.",
      primaryPrey: ["Striped Mullet (Mugil cephalus)", "Atlantic Croaker (Micropogonias undulatus)", "Pinfish (Lagodon rhomboides)", "Coastal Loliginid Squid"],
      preySpecializationRationale: "Conical homodont teeth cannot chew or slice flesh; prey must be swallowed whole head-first. Schooling coastal teleost fish aggregate in high densities, providing lipid-rich nutrition that can be ingested rapidly without choking risks.",
      trophicGuild: "Apex Coastal / Estuarine Piscivore"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Hydrodynamically streamlined cetacean skeleton featuring cranial telescoping, hyperphalangy, and rigid cervical shock absorption.",
      boneAdaptations: [
        {
          boneName: "Fused Anterior Cervical Vertebrae (Rigid Neck Axis)",
          geometricDesign: "First two cervical vertebrae (atlas and axis) are fused into a rigid bony mass.",
          survivalUtility: "Prevents neck wobbling or drag-induced injury at 35 km/h, stabilizing the head to maintain a steady biosonar acoustic beam."
        },
        {
          boneName: "Hyperphalangeal Pectoral Hydrofoil Flippers",
          geometricDesign: "Flippers contain 7-9 phalangeal bones per digit (compared to 3 in terrestrial mammals).",
          survivalUtility: "Creates an elongated, cambered hydrofoil flipper for tight banking turns and rapid deceleration in shallow mud flats."
        },
        {
          boneName: "Cranial Telescoping (Maxillae Sliding over Frontals)",
          geometricDesign: "Premaxillary and maxillary facial bones have migrated backward over the frontal cranium.",
          survivalUtility: "Positions the respiratory blowhole on top of the head, allowing rapid breathing at the surface while swimming at top speed."
        },
        {
          boneName: "Chevron Bones (Haemal Arches) beneath Caudal Spine",
          geometricDesign: "V-shaped bones articulating with the ventral side of tail vertebrae.",
          survivalUtility: "Protects major caudal blood vessels and anchors massive epaxial/hypaxial muscles that power high-thrust swimming flukes."
        }
      ]
    }
  },

  "poecile-atricapillus": {
    huntingStrategy: {
      tacticalMethod: "Acrobatic Foliage Gleaning & Spatial Memory Scatter-Hoarding",
      executionSteps: "1. Acrobatic foraging through canopy and needle clusters, frequently hanging upside-down. 2. Prying open bark crevices and cone scales with sharp bill. 3. Autumn scatter-hoarding of up to 100,000 seeds across thousands of bark sites. 4. Winter retrieval guided by seasonally expanded hippocampus.",
      primaryPrey: ["Overwintering Insect Eggs & Pupae", "Spiders (Araneae)", "Conifer Seeds (Pine, Hemlock)", "Sunflower & Goldenrod Seeds"],
      preySpecializationRationale: "Tiny 11-gram body mass creates a high surface-area-to-volume ratio, causing extreme heat loss in sub-zero winter temperatures. Chickadees must consume up to 60% of their body weight daily in high-fat insect lipids and oil-dense seeds to fuel shivering thermogenesis throughout freezing nights.",
      trophicGuild: "Arboreal Invertivore & Scatter-Hoarding Granivore"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Ultra-lightweight hollow pneumatized avian skeleton with fused landing platforms and automatic perching tendon locks.",
      boneAdaptations: [
        {
          boneName: "Pneumatized Hollow Long Bones with Internal Trabeculae",
          geometricDesign: "Humerus and femur are hollow, connected to the respiratory air sacs, and braced by microscopic criss-crossing bony struts.",
          survivalUtility: "Dramatically reduces skeletal weight while maintaining structural rigidity during high-acceleration flight evasions."
        },
        {
          boneName: "Fused Synsacrum & Pygostyle Plate",
          geometricDesign: "Posterior thoracic, lumbar, and sacral vertebrae are fused into an unyielding pelvic plate, ending in a fused tail bone.",
          survivalUtility: "Provides a rigid, stable platform for the legs during acrobatic hanging, and anchors tail retrix feathers for instant mid-air braking."
        },
        {
          boneName: "Deeply Keeled Sternum (Carina)",
          geometricDesign: "Large vertical blade of bone projecting from the breastbone.",
          survivalUtility: "Anchors the massive pectoralis and supracoracoideus flight muscles that power high-cadence wing beats."
        },
        {
          boneName: "Anisodactyl Foot with Automatic Tendon Lock Mechanism",
          geometricDesign: "Three toes forward, one backward (hallux), linked to flexor tendons running behind the ankle joint.",
          survivalUtility: "When the bird perches and flexes its ankle, the tendons mechanically tighten, locking the toes around twigs without active muscular effort."
        }
      ]
    }
  },

  "dendrobates-tinctorius": {
    huntingStrategy: {
      tacticalMethod: "Diurnal Active Leaf-Litter Stalking & Ballistic Tongue Projection",
      executionSteps: "1. Bold daylight foraging across rainforest floor leaf litter (aposematism). 2. Binocular visual detection of crawling micro-invertebrates. 3. Stalks to within 5 - 10 mm. 4. Hydrostatic tongue projection flips sticky tongue forward in 20 milliseconds. 5. Prey pulled into mouth and pressed against palate by sinking eyeballs.",
      primaryPrey: ["Formicid Ants (Pheidole, Solenopsis)", "Oribatid Mites (Scheloribatidae)", "Collembolan Springtails", "Small Leaf-Litter Beetles"],
      preySpecializationRationale: "Dart frogs do not synthesize pumiliotoxins and batrachotoxins endogenously! They sequester toxic lipophilic alkaloids strictly from their diet of venomous ants and mites. Without consuming these specific arthropods, the frog loses its chemical defense mechanism.",
      trophicGuild: "Diurnal Specialized Formicivore / Acarivore (Alkaloid Sequestration)"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Saltatorial amphibian skeleton engineered for high-acceleration catapult jumping and shock absorption.",
      boneAdaptations: [
        {
          boneName: "Fused Urostyle (Saltatorial Rod)",
          geometricDesign: "Post-cranial tail vertebrae are fused into a rigid cylindrical rod of bone running parallel to the pelvis.",
          survivalUtility: "Acts as an unyielding shock strut, transmitting the full explosive force of the hind limbs directly along the body axis during leaping."
        },
        {
          boneName: "Elongated Fused Tibiofibula & Ankle Extension",
          geometricDesign: "Tibia and fibula are fused into a single dense bone, and ankle bones (astragalus and calcaneum) are elongated into a secondary lever segment.",
          survivalUtility: "Creates a multi-jointed catapult lever system that generates extraordinary take-off velocity to escape predators."
        },
        {
          boneName: "Edentulous Mandible & Palatal Eye Openings",
          geometricDesign: "Lower jaw completely lacks teeth; the palatal roof features large openings directly beneath the eye sockets.",
          survivalUtility: "Allows the frog to retract its eyeballs downward into the mouth cavity (via retractor bulbi muscles) to physically push captured ants down the esophagus."
        },
        {
          boneName: "Flexible Ilio-Sacral Joint Hinge",
          geometricDesign: "Pelvis articulates with the sacral vertebra via a mobile sliding joint.",
          survivalUtility: "Absorbs monumental deceleration shock when landing on hard rainforest tree roots or rocks."
        }
      ]
    }
  },

  "cynomys-gunnisoni": {
    huntingStrategy: {
      tacticalMethod: "Colonial Clip-and-Clear & Multi-Directional Vigilant Grazing",
      executionSteps: "1. Emerges from burrows following morning environmental warming. 2. Coterie members fan out across grazing radius (within 30 m of burrow rims). 3. Actively clips tall vegetation to ground level to eliminate predator ambush cover. 4. Gathers grasses and seeds, diving underground upon acoustic predator alarm calls.",
      primaryPrey: ["Blue Grama Grass (Bouteloua gracilis)", "Buffalo Grass (Buchloe dactyloides)", "Prairie Sedges & Forbs", "Subterranean Tubers & Roots"],
      preySpecializationRationale: "Non-ruminant caecal fermenter specialized to extract water and carbohydrates from arid steppe vegetation. In hot dry summers, prairie dogs obtain 100% of their metabolic water directly from succulent grass stems and roots, surviving with zero standing water.",
      trophicGuild: "Colonial Herbivore / Ecosystem Engineer Grazer"
    },
    skeletalBiomechanics: {
      overallArchitecture: "Fossorial rodent skeleton engineered for continuous subterranean tunneling, panoramic vision, and bone-hard plant shearing.",
      boneAdaptations: [
        {
          boneName: "Continuous-Growth Chisel Hypsodont Incisors",
          geometricDesign: "Four massive curved incisors with thick orange enamel on the anterior surface and softer dentine behind.",
          survivalUtility: "Enamel wears down slower than dentine, creating a self-sharpening bevel edge capable of shearing through tough silica-rich prairie grasses and roots without dulling."
        },
        {
          boneName: "Hypertrophied Olecranon Process on Ulna",
          geometricDesign: "Elbow bone features an exceptionally elongated, backward-pointing bone lever.",
          survivalUtility: "Creates a class-1 mechanical lever that multiplies triceps extension torque, enabling prairie dogs to dig 10-meter-deep tunnel networks through hard clay."
        },
        {
          boneName: "Dorsolaterally Shifted Eye Orbits",
          geometricDesign: "Eye sockets are placed high and far back on the skull.",
          survivalUtility: "Provides an unobstructed 360-degree panoramic view to spot approaching hawks and eagles even while grazing with head down at soil level."
        },
        {
          boneName: "Massive Zygomatic Arch with Deep Masseteric Fossa",
          geometricDesign: "Broad, flared cheekbones anchoring massive masseter muscles.",
          survivalUtility: "Powers rapid forward-and-backward propalinal grinding movements of the molars to pulverize high-silica prairie grasses."
        }
      ]
    }
  }
};
