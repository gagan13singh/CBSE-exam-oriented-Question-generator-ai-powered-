/**
 * client/src/data/syllabusData.js
 *
 * Complete CBSE syllabus for Classes 9–12 embedded in the frontend.
 * Eliminates the /api/v1/syllabus network call — works offline, instant load.
 *
 * ─── Copyright Notice ────────────────────────────────────────────────────────
 * Chapter and topic NAMES are factual identifiers and are not copyrightable.
 * Source: CBSE Curriculum 2025-26 (cbseacademic.nic.in)
 * We do NOT host any NCERT textbook content. Official free PDFs: ncert.nic.in
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SYLLABUS = {
  class_9: {
    Mathematics: {
      'Number Systems':                         ['Irrational Numbers', 'Real Numbers on Number Line', 'Surds', 'Laws of Exponents'],
      'Polynomials':                            ['Degree of Polynomial', 'Zeroes', 'Remainder Theorem', 'Factor Theorem', 'Algebraic Identities'],
      'Coordinate Geometry':                    ['Cartesian Plane', 'Plotting Points', 'Quadrants', 'Distance Formula'],
      'Linear Equations in Two Variables':      ['Solutions', 'Graph of Linear Equations', 'Equations of Lines Parallel to Axes'],
      "Introduction to Euclid's Geometry":      ['Axioms', 'Postulates', 'Theorems', 'Euclids Five Postulates'],
      'Lines and Angles':                       ['Complementary & Supplementary Angles', 'Linear Pairs', 'Parallel Lines', 'Transversal', 'Angle Sum'],
      'Triangles':                              ['Congruence (SSS SAS ASA AAS RHS)', 'Properties of Triangles', 'Inequalities in Triangle'],
      'Quadrilaterals':                         ['Parallelogram Properties', 'Rectangle', 'Rhombus', 'Square', 'Trapezium', 'Mid-Point Theorem'],
      'Areas of Parallelograms and Triangles':  ['Figures on Same Base', 'Area Theorems', 'Median'],
      'Circles':                                ['Chords', 'Arcs', 'Angles Subtended', 'Cyclic Quadrilateral'],
      'Constructions':                          ['Angle Bisector', 'Perpendicular Bisector', 'Triangle Constructions'],
      "Heron's Formula":                        ['Semi-perimeter', 'Area of Triangle', 'Area of Quadrilateral'],
      'Surface Areas and Volumes':              ['Cuboid', 'Cube', 'Right Circular Cylinder', 'Right Circular Cone', 'Sphere', 'Hemisphere'],
      'Statistics':                             ['Data Collection', 'Bar Graph', 'Histogram', 'Frequency Polygon', 'Mean', 'Median', 'Mode'],
      'Probability':                            ['Experimental Probability', 'Events', 'Sample Space'],
    },
    Science: {
      'Matter in Our Surroundings':             ['States of Matter', 'Evaporation', 'Sublimation', 'Latent Heat', 'Diffusion'],
      'Is Matter Around Us Pure?':              ['Mixtures', 'Solutions', 'Suspension', 'Colloid', 'Separation Methods', 'Elements & Compounds'],
      'Atoms and Molecules':                    ['Laws of Chemical Combination', 'Daltons Atomic Theory', 'Atomic Mass', 'Mole Concept', 'Molecular Formula'],
      'Structure of the Atom':                  ['Subatomic Particles', 'Thomson Model', 'Rutherford Model', 'Bohr Model', 'Valence Electrons', 'Isotopes'],
      'The Fundamental Unit of Life':           ['Cell Theory', 'Prokaryotic vs Eukaryotic', 'Cell Organelles', 'Cell Membrane', 'Diffusion & Osmosis'],
      'Tissues':                                ['Plant Tissues (Meristematic, Permanent)', 'Animal Tissues (Epithelial, Connective, Muscular, Nervous)'],
      'Diversity in Living Organisms':          ['Classification Hierarchy', 'Kingdoms (Monera Protista Fungi Plantae Animalia)', 'Nomenclature'],
      'Motion':                                 ['Distance & Displacement', 'Speed & Velocity', 'Acceleration', 'Equations of Motion', 'Graphical Representation'],
      'Force and Laws of Motion':               ['Inertia', 'Newtons Laws', 'Momentum', 'Conservation of Momentum', 'Action-Reaction'],
      'Gravitation':                            ['Universal Law of Gravitation', 'g on Earth', 'Free Fall', 'Mass vs Weight', 'Thrust & Pressure', 'Archimedes Principle', 'Buoyancy'],
      'Work and Energy':                        ['Work Done by Force', 'Kinetic Energy', 'Potential Energy', 'Conservation of Energy', 'Power', 'Commercial Unit'],
      'Sound':                                  ['Wave Motion', 'Characteristics of Sound', 'Speed of Sound', 'Reflection', 'Echo', 'SONAR', 'Human Ear'],
      'Why Do We Fall Ill?':                    ['Health', 'Disease Causes', 'Infectious Diseases', 'Modes of Transmission', 'Immunity', 'Vaccination'],
      'Natural Resources':                      ['Biogeochemical Cycles', 'Carbon Cycle', 'Nitrogen Cycle', 'Water Cycle', 'Ozone Layer'],
      'Improvement in Food Resources':          ['Crop Improvement', 'Manure & Fertilisers', 'Irrigation', 'Animal Husbandry', 'Poultry', 'Fisheries'],
    },
    'Social Science': {
      'The French Revolution':                  ['Causes', 'Estates System', 'Reign of Terror', 'Napoleon', 'Legacy'],
      'Socialism in Europe and Russian Revolution': ['Industrialisation Impact', 'Socialist Ideas', '1905 Revolution', 'February & October Revolution', 'Stalinist Russia'],
      'Nazism and the Rise of Hitler':          ['Weimar Republic', 'Rise of Hitler', 'Nazi Ideology', 'Holocaust', 'Youth in Nazi Germany'],
      'Forest Society and Colonialism':         ['Colonial Forest Policy', 'Resistance', 'Case Studies (Java, Bastar)'],
      'Pastoralists in the Modern World':       ['Nomadic Pastoralism', 'Colonial Impact', 'Case Studies (India, Africa)'],
      'India – Size and Location':              ['Latitude-Longitude', 'Neighbours', 'Importance of Location'],
      'Physical Features of India':             ['Geological History', 'Himalayas', 'Northern Plains', 'Peninsular Plateau', 'Islands'],
      'Drainage':                               ['Himalayan Rivers', 'Peninsular Rivers', 'Lakes', 'Role of Rivers'],
      'Climate':                                ['Monsoon', 'Seasons', 'Distribution of Rainfall', 'ENSO'],
      'Natural Vegetation and Wildlife':        ['Types of Forests', 'Wildlife', 'Biosphere Reserves'],
      'Population':                             ['Census', 'Density', 'Age Structure', 'Sex Ratio', 'Literacy', 'Migration'],
      'What is Democracy? Why Democracy?':      ['Features', 'Arguments For/Against', 'Comparison'],
      'Constitutional Design':                  ['South Africa', 'Making of Indian Constitution', 'Guiding Values'],
      'Electoral Politics':                     ['Elections', 'Voting', 'Model Code of Conduct'],
      'Working of Institutions':                ['Parliament', 'Executive', 'Judiciary'],
      'Democratic Rights':                      ['Fundamental Rights', 'Rights in Democracy', 'Expanded Rights'],
      'The Story of Village Palampur':          ['Farming', 'Non-Farm Activities', 'Capital and Credit'],
      'People as Resource':                     ['Human Capital', 'Unemployment', 'Education & Health'],
      'Poverty as a Challenge':                 ['Poverty Line', 'Causes', 'Anti-Poverty Measures'],
      'Food Security in India':                 ['Food Security Pillars', 'Buffer Stock', 'PDS', 'Hunger'],
    },
    English: {
      'Beehive – Prose':                        ['The Fun They Had', 'The Sound of Music', 'The Little Girl', 'A Truly Beautiful Mind', 'The Snake and the Mirror', 'My Childhood', 'Packing', 'Reach for the Top', 'The Bond of Love', 'Kathmandu', 'If I Were You'],
      'Beehive – Poetry':                       ['The Road Not Taken', 'Wind', 'Rain on the Roof', 'The Lake Isle of Innisfree', 'A Legend of the Northland', 'No Men Are Foreign', 'The Duck and the Kangaroo', 'On Killing a Tree', 'The Snake Trying', 'A Slumber Did My Spirit Seal'],
      'Moments – Supplementary':                ['The Lost Child', 'The Adventures of Toto', "Iswaran the Storyteller", "In the Kingdom of Fools", 'The Happy Prince', 'Weathering the Storm in Ersama', 'The Last Leaf', 'A House is Not a Home', 'The Accidental Tourist', 'The Beggar'],
      'Grammar and Writing':                    ['Tenses', 'Modals', 'Active-Passive', 'Reported Speech', 'Letter Writing', 'Descriptive Writing'],
    },
  },

  class_10: {
    Mathematics: {
      'Real Numbers':                           ['Euclids Division Lemma', 'Fundamental Theorem of Arithmetic', 'Irrational Numbers', 'Decimal Expansions'],
      'Polynomials':                            ['Zeroes and Coefficients', 'Division Algorithm', 'Geometric Meaning of Zeroes'],
      'Pair of Linear Equations in Two Variables': ['Graphical Method', 'Substitution', 'Elimination', 'Cross Multiplication', 'Reducible Equations'],
      'Quadratic Equations':                    ['Standard Form', 'Factorisation', 'Completing the Square', 'Quadratic Formula', 'Discriminant'],
      'Arithmetic Progressions':               ['General Term', 'Sum of AP', 'Application Problems'],
      'Triangles':                              ['Similar Triangles', 'BPT (Thales Theorem)', 'Criteria of Similarity', 'Areas of Similar Triangles', 'Pythagoras Theorem'],
      'Coordinate Geometry':                    ['Distance Formula', 'Section Formula', 'Area of Triangle', 'Midpoint'],
      'Introduction to Trigonometry':           ['Trig Ratios', 'Trig Identities', 'Complementary Angles', 'T-table Values'],
      'Some Applications of Trigonometry':      ['Heights and Distances', 'Angle of Elevation', 'Angle of Depression'],
      'Circles':                                ['Tangent to Circle', 'Number of Tangents', 'Length of Tangent'],
      'Constructions':                          ['Division of Line Segment', 'Similar Triangle', 'Tangent to Circle'],
      'Areas Related to Circles':              ['Area of Sector', 'Area of Segment', 'Combination of Figures'],
      'Surface Areas and Volumes':              ['Combinations of Solids', 'Conversion of Shapes', 'Frustum of Cone'],
      'Statistics':                             ['Mean (Direct, Assumed Mean, Step Deviation)', 'Median', 'Mode', 'Cumulative Frequency', 'Ogive'],
      'Probability':                            ['Classical Probability', 'Complementary Events', 'Probability Problems'],
    },
    Science: {
      'Chemical Reactions and Equations':       ['Types of Chemical Reactions', 'Balancing Equations', 'Oxidation-Reduction', 'Effects of Oxidation'],
      'Acids, Bases and Salts':                 ['Properties', 'pH Scale', 'Neutralisation', 'Common Salts', 'Baking Soda', 'Bleaching Powder'],
      'Metals and Non-metals':                  ['Properties', 'Reactivity Series', 'Extraction', 'Corrosion', 'Ionic Bonding'],
      'Carbon and its Compounds':              ['Bonding in Carbon', 'Allotropes', 'Homologous Series', 'Functional Groups', 'Reactions', 'Soaps and Detergents'],
      'Periodic Classification of Elements':   ['Early Classification', 'Dobereiners Triads', 'Mendeleevs Table', 'Modern Periodic Table', 'Trends'],
      'Life Processes':                         ['Nutrition (Autotrophic, Heterotrophic)', 'Respiration', 'Transportation in Plants & Animals', 'Excretion'],
      'Control and Coordination':               ['Nervous System', 'Reflex Arc', 'Brain', 'Endocrine System', 'Hormones', 'Plant Hormones'],
      'How do Organisms Reproduce?':           ['Asexual Reproduction', 'Sexual Reproduction in Plants', 'Reproduction in Humans', 'Contraception', 'STDs'],
      'Heredity and Evolution':                 ['Mendels Laws', 'Monohybrid & Dihybrid Cross', 'Sex Determination', 'Evolution', 'Natural Selection', 'Speciation'],
      'Light – Reflection and Refraction':      ['Laws of Reflection', 'Spherical Mirrors', 'Mirror Formula', 'Refraction', 'Snells Law', 'Lenses', 'Lens Formula', 'Power'],
      'Human Eye and the Colourful World':      ['Structure of Eye', 'Defects of Vision', 'Atmospheric Refraction', 'Dispersion', 'Scattering'],
      'Electricity':                            ['Ohms Law', 'Resistance', 'Series & Parallel Circuits', 'Heating Effect', 'Power & Energy'],
      'Magnetic Effects of Electric Current':   ['Magnetic Field', 'Solenoid', 'Electromagnet', 'Force on Conductor', 'Electric Motor', 'Electromagnetic Induction', 'Generator', 'AC vs DC'],
      'Sources of Energy':                      ['Conventional Sources', 'Non-Conventional Sources', 'Solar Energy', 'Wind Energy', 'Nuclear Energy'],
      'Our Environment':                        ['Ecosystem', 'Food Chain & Web', 'Trophic Levels', 'Biodegradable Waste', 'Ozone Depletion'],
      'Management of Natural Resources':        ['Conservation', 'Forests & Wildlife', 'Water', 'Coal & Petroleum', 'Sustainable Development'],
    },
    'Social Science': {
      'The Rise of Nationalism in Europe':      ['French Revolution Legacy', 'Making of Nationalism', 'Unification of Germany & Italy', 'Visualising the Nation'],
      'Nationalism in India':                   ['Non-Cooperation Movement', 'Civil Disobedience Movement', 'Sense of Collective Belonging'],
      'The Making of a Global World':           ['Silk Routes', 'Colonialism', '19th Century Economy', 'Inter-War Economy', 'Post-War Recovery'],
      'The Age of Industrialisation':           ['Proto-Industrialisation', 'Factory System', 'Indian Textiles & Industry'],
      'Print Culture and the Modern World':     ['Gutenberg Press', 'Print in Europe', 'Print in India', 'Women and Print', 'Print and the Poor'],
      'Resources and Development':              ['Types of Resources', 'Resource Planning', 'Land Degradation', 'Soil Types'],
      'Forest and Wildlife Resources':          ['Types of Forests', 'Conservation', 'Community & Conservation'],
      'Water Resources':                        ['Dams', 'Rainwater Harvesting', 'Water Scarcity'],
      'Agriculture':                            ['Types of Farming', 'Cropping Pattern', 'Food Security', 'Agricultural Reforms'],
      'Minerals and Energy Resources':          ['Types of Minerals', 'Distribution', 'Conservation', 'Energy Resources'],
      'Manufacturing Industries':               ['Importance', 'Types', 'Location Factors', 'Industrial Pollution'],
      'Lifelines of National Economy':          ['Roadways', 'Railways', 'Airways', 'Waterways', 'Communication', 'Trade'],
      'Power Sharing':                          ['Why Power Sharing', 'Forms of Power Sharing', 'Belgium & Sri Lanka'],
      'Federalism':                             ['Features', 'How Federalism Works in India', 'Decentralisation'],
      'Democracy and Diversity':                ['Social Differences', 'Politics of Social Divisions'],
      'Gender, Religion and Caste':             ['Gender & Politics', 'Religion & Politics', 'Caste & Politics'],
      'Popular Struggles and Movements':        ['Democratic Conflicts', 'Bolivia Water War', 'Nepal Democracy'],
      'Political Parties':                      ['Functions', 'Party Systems', 'National & State Parties', 'Challenges'],
      'Outcomes of Democracy':                  ['Accountability', 'Economic Growth', 'Reduction of Inequality', 'Dignity'],
      'Challenges to Democracy':                ['Deepening Democracy', 'Reform', 'Thoughtful Voting'],
      'Development':                            ['Development Goals', 'Income & Other Criteria', 'Sustainability'],
      'Sectors of the Indian Economy':          ['Primary Secondary Tertiary', 'GDP', 'Organised & Unorganised', 'Employment'],
      'Money and Credit':                       ['Barter System', 'Money', 'Credit', 'Formal & Informal Sectors', 'SHGs'],
      'Globalisation and the Indian Economy':   ['MNCs', 'Trade Barriers', 'WTO', 'Impact of Globalisation', 'Fair Globalisation'],
      'Consumer Rights':                        ['Consumer Awareness', 'COPRA', 'Consumer Redressal', 'Quality Marks'],
    },
    English: {
      'First Flight – Prose':                   ['A Letter to God', 'Nelson Mandelas Long Walk to Freedom', 'Two Stories about Flying', 'From the Diary of Anne Frank', 'Hundred Dresses Part 1 & 2', 'Glimpses of India', 'Mijbil the Otter', 'Madam Rides the Bus', 'The Sermon at Benares', 'The Proposal'],
      'First Flight – Poetry':                  ['Dust of Snow', 'Fire and Ice', 'A Tiger in the Zoo', 'How to Tell Wild Animals', 'The Ball Poem', 'Amanda', 'The Trees', 'Fog', 'The Tale of Custard the Dragon', 'For Anne Gregory'],
      'Footprints Without Feet':                ['A Triumph of Surgery', 'The Thief Story', 'The Midnight Visitor', 'A Question of Trust', 'Footprints Without Feet', 'The Making of a Scientist', 'The Necklace', 'The Hack Driver', 'Bholi', 'The Book That Saved the Earth'],
      'Grammar and Writing':                    ['Tenses Review', 'Modals', 'Connectors', 'Active-Passive', 'Reported Speech', 'Formal Letters', 'Analytical Paragraphs', 'Discursive Passages'],
    },
  },

  class_11: {
    Physics: {
      'Physical World':                         ['Scope of Physics', 'Fundamental Forces', 'Nature of Physical Laws'],
      'Units and Measurements':                 ['SI Units', 'Significant Figures', 'Dimensional Analysis', 'Errors in Measurement'],
      'Motion in a Straight Line':              ['Position-Time Graph', 'Velocity', 'Acceleration', 'Kinematic Equations', 'Free Fall'],
      'Motion in a Plane':                      ['Vectors', 'Vector Addition', 'Projectile Motion', 'Uniform Circular Motion', 'Relative Velocity'],
      'Laws of Motion':                         ['Newtons Laws', 'Inertia', 'Momentum', 'Impulse', 'Friction', 'Circular Motion Dynamics'],
      'Work, Energy and Power':                 ['Work-Energy Theorem', 'Conservative Forces', 'Potential Energy', 'Conservation of Mechanical Energy', 'Collisions', 'Power'],
      'System of Particles and Rotational Motion': ['Centre of Mass', 'Torque', 'Angular Momentum', 'Moment of Inertia', 'Rolling Motion'],
      'Gravitation':                            ['Universal Law', 'Acceleration due to Gravity', 'Orbital Speed', 'Escape Velocity', 'Satellites', 'Keplers Laws'],
      'Mechanical Properties of Solids':        ['Stress and Strain', 'Elastic Moduli', 'Hookes Law', 'Stress-Strain Curve'],
      'Mechanical Properties of Fluids':        ['Pressure', 'Bernoullis Theorem', 'Viscosity', 'Surface Tension', 'Capillary Rise'],
      'Thermal Properties of Matter':           ['Heat and Temperature', 'Thermal Expansion', 'Heat Capacity', 'Calorimetry', 'Conduction', 'Convection', 'Radiation'],
      'Thermodynamics':                         ['Zeroth, First, Second Laws', 'Work Done by Gas', 'Isothermal & Adiabatic', 'Heat Engines', 'Carnot Engine', 'Entropy'],
      'Kinetic Theory':                         ['Molecular Nature of Matter', 'KTG', 'Degrees of Freedom', 'RMS Speed', 'Law of Equipartition'],
      'Oscillations':                           ['SHM', 'Amplitude Period Frequency', 'Spring-Mass System', 'Simple Pendulum', 'Resonance', 'Damped Oscillations'],
      'Waves':                                  ['Wave Motion', 'Transverse & Longitudinal', 'Wave Equation', 'Speed of Sound', 'Principle of Superposition', 'Standing Waves', 'Beats', 'Doppler Effect'],
    },
    Chemistry: {
      'Some Basic Concepts of Chemistry':       ['Mole Concept', 'Stoichiometry', 'Limiting Reagent', 'Empirical & Molecular Formula', 'Concentration Terms'],
      'Structure of Atom':                      ['Thomson & Rutherford Model', 'Bohrs Model', 'Quantum Numbers', 'Orbitals', 'Electronic Configuration', 'Aufbau Hunds Pauli'],
      'Classification of Elements and Periodicity': ['Historical Classification', 'Modern Periodic Table', 'Periodic Trends (IE, EA, EN, Atomic Radius)', 'Shielding'],
      'Chemical Bonding and Molecular Structure': ['Ionic Bond', 'Covalent Bond', 'VSEPR', 'Hybridisation', 'MOT', 'Hydrogen Bond', 'Resonance'],
      'States of Matter':                       ['Gas Laws', 'Ideal Gas Equation', 'Kinetic Molecular Theory', 'Real Gases', 'van der Waals Equation', 'Liquefaction'],
      'Thermodynamics':                         ['System Surroundings', 'Enthalpy', 'Hess Law', 'Bond Enthalpy', 'Entropy', 'Gibbs Free Energy', 'Spontaneity'],
      'Equilibrium':                            ['Law of Mass Action', 'Kp Kc', 'Le Chateliers Principle', 'Acid-Base Equilibrium', 'pH', 'Buffer', 'Solubility Product'],
      'Redox Reactions':                        ['Oxidation State', 'Balancing Redox (HM & OFN)', 'Electrochemical Series'],
      'Hydrogen':                               ['Occurrence', 'Preparation & Properties', 'Water', 'Hydrogen Peroxide', 'Heavy Water', 'Hydrides'],
      'The s-Block Elements':                   ['Alkali Metals', 'Alkaline Earth Metals', 'Anomalous Behaviour of Li & Be', 'Important Compounds'],
      'The p-Block Elements':                   ['Groups 13-14', 'Boron Family', 'Carbon Family', 'Allotropes', 'Important Compounds', 'Anomalous Behaviour'],
      'Organic Chemistry – Basic Principles':   ['IUPAC Nomenclature', 'Structural Isomerism', 'Electronic Displacement Effects', 'Reaction Intermediates', 'Types of Organic Reactions'],
      'Hydrocarbons':                           ['Alkanes (Conformations)', 'Alkenes (Geometrical Isomerism)', 'Alkynes', 'Aromatic Hydrocarbons', 'Reactions'],
      'Environmental Chemistry':                ['Air Pollution', 'Water Pollution', 'Soil Pollution', 'Acid Rain', 'Greenhouse Effect', 'Ozone Depletion'],
    },
    Biology: {
      'The Living World':                       ['Diversity', 'Taxonomy', 'Taxonomic Hierarchy', 'Binomial Nomenclature', 'ICBN'],
      'Biological Classification':              ['Two Kingdom to Five Kingdom', 'Monera', 'Protista', 'Fungi', 'Viruses', 'Lichens'],
      'Plant Kingdom':                          ['Algae', 'Bryophytes', 'Pteridophytes', 'Gymnosperms', 'Angiosperms', 'Alternation of Generations'],
      'Animal Kingdom':                         ['Basis of Classification', 'Phyla from Porifera to Chordata', 'Non-Chordates vs Chordates'],
      'Morphology of Flowering Plants':         ['Root', 'Stem', 'Leaf', 'Inflorescence', 'Flower', 'Fruit', 'Seed', 'Families (Fabaceae Solanaceae Liliaceae)'],
      'Anatomy of Flowering Plants':            ['Plant Tissues', 'Tissue Systems', 'Anatomy of Dicot & Monocot Root Stem Leaf'],
      'Structural Organisation in Animals':     ['Epithelial Tissue', 'Connective Tissue', 'Muscular Tissue', 'Neural Tissue', 'Cockroach Anatomy', 'Frog Anatomy'],
      'Cell: The Unit of Life':                 ['Cell Theory', 'Prokaryotic Cell', 'Eukaryotic Cell', 'Cell Organelles in Detail'],
      'Biomolecules':                           ['Carbohydrates', 'Proteins', 'Lipids', 'Nucleic Acids', 'Enzymes', 'Metabolic Basis'],
      'Cell Cycle and Cell Division':           ['Cell Cycle', 'Mitosis (Stages)', 'Meiosis (Stages)', 'Significance'],
      'Transport in Plants':                    ['Diffusion', 'Osmosis', 'Water Potential', 'Absorption', 'Translocation', 'Phloem Loading'],
      'Mineral Nutrition':                      ['Essential Elements', 'Deficiency Symptoms', 'Nitrogen Fixation', 'Nitrogen Cycle'],
      'Photosynthesis in Higher Plants':        ['Site', 'Light Reactions', 'Calvin Cycle', 'C3 vs C4', 'CAM', 'Photorespiration', 'Factors Affecting'],
      'Respiration in Plants':                  ['Aerobic & Anaerobic Respiration', 'Glycolysis', 'Krebs Cycle', 'ETS', 'ATP Yield', 'RQ'],
      'Plant Growth and Development':           ['Growth Phases', 'Plant Growth Regulators', 'Photoperiodism', 'Vernalisation', 'Seed Dormancy'],
      'Digestion and Absorption':               ['GI Tract', 'Digestive Glands', 'Digestion of Carbohydrates Proteins Fats', 'Absorption', 'Disorders'],
      'Breathing and Exchange of Gases':        ['Respiratory Organs', 'Mechanism of Breathing', 'Respiratory Volumes', 'Gas Exchange', 'Transport of Gases', 'Disorders'],
      'Body Fluids and Circulation':            ['Blood Composition', 'Blood Groups', 'Coagulation', 'Heart Structure', 'Cardiac Cycle', 'ECG', 'Lymph'],
      'Excretory Products and their Elimination': ['Modes of Excretion', 'Nephron Structure', 'Urine Formation', 'Regulation', 'Disorders', 'Dialysis'],
      'Locomotion and Movement':                ['Types of Movement', 'Skeletal System', 'Types of Joints', 'Muscle Contraction', 'Disorders'],
      'Neural Control and Coordination':        ['Neuron Structure', 'Impulse Conduction', 'Brain', 'Spinal Cord', 'Reflex Arc', 'Sense Organs'],
      'Chemical Coordination and Integration':  ['Endocrine Glands', 'Hormones', 'Mechanism of Action', 'Disorders'],
    },
    Mathematics: {
      'Sets':                                   ['Representation', 'Types of Sets', 'Venn Diagrams', 'Operations (Union Intersection Complement)', 'Laws'],
      'Relations and Functions':                ['Cartesian Product', 'Types of Relations', 'Types of Functions', 'Domain Range', 'Graphs'],
      'Trigonometric Functions':                ['Unit Circle', 'Trig Functions', 'Graphs', 'Identities', 'Equations', 'Properties of Inverse Trig'],
      'Principle of Mathematical Induction':    ['Statement of PMI', 'Applications', 'Divisibility & Inequality Proofs'],
      'Complex Numbers and Quadratic Equations': ['Argand Plane', 'Modulus Argument', 'Algebra of Complex Numbers', 'Roots of Quadratic', 'Discriminant'],
      'Linear Inequalities':                    ['Algebraic Solutions', 'Graphical Solutions', 'System of Inequalities'],
      'Permutations and Combinations':          ['Fundamental Principle', 'Permutations (nPr)', 'Combinations (nCr)', 'Circular Permutation'],
      'Binomial Theorem':                       ['Binomial Expansion', 'General Term', 'Middle Term', 'Properties'],
      'Sequences and Series':                   ['AP: General Term, Sum', 'GP: General Term, Sum, Infinite GP', 'Special Series', 'AM-GM Inequality'],
      'Straight Lines':                         ['Slope', 'Forms of Line Equations', 'Angle Between Lines', 'Distance from a Point', 'Family of Lines'],
      'Conic Sections':                         ['Circle', 'Parabola', 'Ellipse', 'Hyperbola', 'Standard Forms'],
      'Introduction to Three Dimensional Geometry': ['Coordinate Axes', 'Distance Formula', 'Section Formula', 'Locus'],
      'Limits and Derivatives':                 ['Intuitive Idea of Limit', 'Algebra of Limits', 'Standard Limits', 'Derivative Definition', 'Rules of Differentiation'],
      'Statistics':                             ['Measures of Dispersion', 'Range', 'Mean Deviation', 'Variance', 'Standard Deviation', 'Coefficient of Variation'],
      'Probability':                            ['Random Experiments', 'Events', 'Axiomatic Approach', 'Conditional Probability', 'Independent Events'],
    },
  },

  class_12: {
    Physics: {
      'Electric Charges and Fields':            ['Coulombs Law', 'Electric Field', 'Field Lines', 'Gauss Law', 'Applications of Gauss Law'],
      'Electrostatic Potential and Capacitance': ['Electric Potential', 'Equipotential Surfaces', 'Relation E and V', 'Capacitance', 'Parallel Plate Capacitor', 'Dielectrics', 'Energy Stored'],
      'Current Electricity':                    ['Drift Velocity', 'Ohms Law', 'Resistivity', 'Temperature Dependence', 'Kirchhoffs Laws', 'Wheatstone Bridge', 'Potentiometer'],
      'Moving Charges and Magnetism':           ['Biot-Savart Law', 'Amperes Law', 'Solenoid & Toroid', 'Force on Charge', 'Cyclotron', 'Moving Coil Galvanometer'],
      'Magnetism and Matter':                   ['Bar Magnet', 'Earth Magnetism', 'Para Dia Ferromagnetism', 'Hysteresis'],
      'Electromagnetic Induction':              ['Faradays Laws', 'Lenzs Law', 'Eddy Currents', 'Self & Mutual Inductance', 'AC Generator'],
      'Alternating Current':                    ['RMS & Peak Values', 'AC Circuits (R, L, C)', 'Resonance', 'Power in AC', 'LC Oscillations', 'Transformer'],
      'Electromagnetic Waves':                  ['Displacement Current', 'Maxwells Equations', 'EM Spectrum', 'Properties'],
      'Ray Optics and Optical Instruments':     ['Reflection', 'Refraction', 'Lens Maker Equation', 'Prism', 'Dispersion', 'Optical Instruments (Microscope, Telescope)'],
      'Wave Optics':                            ['Wavefront', 'Huygens Principle', 'Interference', 'Youngs Double Slit', 'Diffraction', 'Polarisation'],
      'Dual Nature of Radiation and Matter':    ['Photoelectric Effect', 'Einsteins Equation', 'de Broglie Wavelength', 'Davisson-Germer Experiment'],
      'Atoms':                                  ['Rutherfords Model', 'Bohrs Model', 'Spectral Series', 'Energy Levels'],
      'Nuclei':                                 ['Nuclear Size & Density', 'Binding Energy', 'Nuclear Forces', 'Radioactivity', 'Nuclear Fission & Fusion'],
      'Semiconductor Electronics':             ['Energy Bands', 'Intrinsic & Extrinsic', 'p-n Junction', 'Diode Applications', 'Zener Diode', 'Transistor', 'Logic Gates'],
    },
    Chemistry: {
      'The Solid State':                        ['Types of Solids', 'Crystal Systems', 'Unit Cell', 'Packing Efficiency', 'Imperfections', 'Properties'],
      'Solutions':                              ['Types of Solutions', 'Concentration Terms', 'Vapour Pressure', 'Raoults Law', 'Colligative Properties', 'Van t Hoff Factor'],
      'Electrochemistry':                       ['Galvanic Cells', 'Nernst Equation', 'Gibbs Energy & EMF', 'Conductance', 'Kohlrausch Law', 'Electrolysis', 'Batteries', 'Corrosion'],
      'Chemical Kinetics':                      ['Rate & Rate Law', 'Order & Molecularity', 'Integrated Rate Equations', 'Half Life', 'Activation Energy', 'Arrhenius Equation', 'Catalysis'],
      'Surface Chemistry':                      ['Adsorption', 'Catalysis', 'Colloids', 'Emulsions', 'Micelles'],
      'General Principles of Isolation of Elements': ['Concentration', 'Extraction', 'Refining', 'Thermodynamic Principles', 'Electrochemical Principles'],
      'The p-Block Elements':                   ['Group 15 (N P Oxoacids)', 'Group 16 (O S H2SO4)', 'Group 17 (Halogens HCl Interhalogen)', 'Group 18 (Noble Gases)'],
      'The d and f-Block Elements':             ['Transition Metals Properties', 'Oxidation States', 'Colour & Magnetism', 'Important Compounds', 'Inner Transition (Lanthanoids Actinoids)'],
      'Coordination Compounds':                ['IUPAC Naming', 'Bonding Theories (VBT CFT)', 'Isomerism', 'Stability Constants', 'Biological Importance'],
      'Haloalkanes and Haloarenes':             ['IUPAC Names', 'Preparation', 'SN1 & SN2', 'Elimination', 'Haloarene Reactions', 'Polyhalogen Compounds'],
      'Alcohols, Phenols and Ethers':           ['Preparation & Properties', 'Reactions of Alcohols', 'Phenol Reactions', 'Ethers', 'Distinctions'],
      'Aldehydes, Ketones and Carboxylic Acids': ['Nucleophilic Addition', 'Aldol Condensation', 'Cannizzaro Reaction', 'Carboxylic Acid Derivatives', 'Hell-Volhard-Zelinsky'],
      'Amines':                                 ['Classification', 'Basicity Comparison', 'Preparation', 'Reactions', 'Diazonium Salts', 'Azo Coupling'],
      'Biomolecules':                           ['Carbohydrates (Types Reactions)', 'Proteins (Structure Functions)', 'Enzymes', 'Nucleic Acids (DNA RNA)', 'Vitamins Hormones'],
      'Polymers':                               ['Addition Polymerisation', 'Condensation Polymerisation', 'Copolymers', 'Natural Rubber', 'Biodegradable Polymers'],
      'Chemistry in Everyday Life':            ['Drugs & Medicines', 'Chemicals in Food (Preservatives Antioxidants)', 'Cleansing Agents'],
    },
    Biology: {
      'Reproduction in Organisms':             ['Modes of Reproduction', 'Asexual Reproduction', 'Sexual Reproduction Stages', 'Events in Sexual Reproduction'],
      'Sexual Reproduction in Flowering Plants': ['Stamen & Pistil Structure', 'Microsporogenesis', 'Megasporogenesis', 'Pollination', 'Fertilisation', 'Fruit & Seed'],
      'Human Reproduction':                    ['Male Reproductive System', 'Female Reproductive System', 'Gametogenesis', 'Fertilisation', 'Implantation', 'Embryonic Development', 'Parturition'],
      'Reproductive Health':                   ['Reproductive Health Issues', 'Population Control', 'Contraception', 'MTP', 'STDs', 'Infertility ART'],
      'Principles of Inheritance and Variation': ['Mendels Laws', 'Monohybrid & Dihybrid Cross', 'Deviation from Mendelism', 'Chromosomal Theory', 'Sex Determination', 'Mutation'],
      'Molecular Basis of Inheritance':        ['DNA Structure', 'DNA Replication', 'Transcription', 'Genetic Code', 'Translation', 'Gene Regulation', 'Human Genome Project'],
      'Evolution':                             ['Origin of Life', 'Theories of Evolution', 'Darwinian Natural Selection', 'Evidence', 'Mechanism', 'Hardy-Weinberg', 'Human Evolution'],
      'Human Health and Disease':              ['Common Diseases', 'Immunity (Innate Acquired)', 'Vaccination', 'AIDS', 'Cancer', 'Drugs & Alcohol Abuse'],
      'Strategies for Enhancement in Food Production': ['Plant Breeding', 'Tissue Culture', 'Biofortification', 'Animal Husbandry', 'Apiculture', 'Aquaculture'],
      'Microbes in Human Welfare':             ['Microbes in Food', 'Industrial Products', 'Sewage Treatment', 'Biogas', 'Biocontrol', 'Biofertilisers'],
      'Biotechnology: Principles and Processes': ['Genetic Engineering', 'Restriction Enzymes', 'Cloning Vectors', 'PCR', 'Recombinant DNA Technology'],
      'Biotechnology and its Applications':    ['GM Crops', 'Insulin Production', 'Gene Therapy', 'Molecular Diagnosis', 'Ethical Issues', 'GEAC'],
      'Organisms and Populations':             ['Organism and Environment', 'Population Attributes', 'Growth Models', 'Interspecific Interactions'],
      'Ecosystem':                             ['Structure', 'Productivity', 'Decomposition', 'Energy Flow', 'Nutrient Cycling', 'Ecosystem Services'],
      'Biodiversity and Conservation':         ['Levels of Biodiversity', 'Patterns', 'Loss of Biodiversity', 'Conservation (In-situ Ex-situ)', 'Hot Spots'],
      'Environmental Issues':                  ['Air Pollution', 'Water Pollution', 'Solid Waste', 'Agrochemicals', 'Greenhouse Effect', 'Ozone Depletion', 'Deforestation'],
    },
    Mathematics: {
      'Relations and Functions':                ['Types of Relations', 'Types of Functions', 'Composite Functions', 'Invertible Functions', 'Binary Operations'],
      'Inverse Trigonometric Functions':        ['Domain & Range', 'Graphs', 'Properties & Identities', 'Equations'],
      'Matrices':                               ['Types of Matrices', 'Operations', 'Transpose', 'Symmetric & Skew-Symmetric', 'Elementary Transformations', 'Invertible Matrices'],
      'Determinants':                           ['Properties', 'Cofactors & Adjoint', 'Inverse Matrix', 'Solution of Equations (Cramers Rule)', 'Area of Triangle'],
      'Continuity and Differentiability':       ['Continuity', 'Differentiability', 'Chain Rule', 'Implicit Differentiation', 'Parametric Differentiation', 'Logarithmic Differentiation', 'Rolles & MVT'],
      'Application of Derivatives':            ['Rate of Change', 'Tangent & Normal', 'Increasing Decreasing Functions', 'Maxima & Minima', 'Approximations'],
      'Integrals':                              ['Standard Integrals', 'Methods (Substitution, Parts, Partial Fractions)', 'Definite Integrals', 'Properties of Definite Integrals', 'Limit of Sum'],
      'Application of Integrals':              ['Area Under Curves', 'Area Between Two Curves'],
      'Differential Equations':                ['Order & Degree', 'General & Particular Solution', 'Variable Separable', 'Homogeneous', 'Linear Differential Equations'],
      'Vector Algebra':                         ['Types of Vectors', 'Addition', 'Dot Product', 'Cross Product', 'Scalar Triple Product', 'Projection'],
      'Three Dimensional Geometry':            ['Direction Cosines & Ratios', 'Equation of Line', 'Angle Between Lines', 'Equation of Plane', 'Angle Between Planes', 'Distance Formulas', 'Coplanarity'],
      'Linear Programming':                    ['Objective Function', 'Constraints', 'Feasible Region', 'Corner Point Method', 'Types of LPP'],
      'Probability':                            ['Conditional Probability', 'Multiplication Theorem', 'Independent Events', 'Bayes Theorem', 'Random Variable', 'Probability Distribution', 'Binomial Distribution', 'Mean & Variance'],
    },
  },
};

/**
 * Helper: get subjects for a class
 * @param {string} cls — '9' | '10' | '11' | '12'
 */
export function getSubjects(cls) {
  return Object.keys(SYLLABUS[`class_${cls}`] || {});
}

/**
 * Helper: get chapters for a class + subject
 * @param {string} cls
 * @param {string} subject
 */
export function getChapters(cls, subject) {
  return Object.keys((SYLLABUS[`class_${cls}`] || {})[subject] || {});
}

/**
 * Helper: get topics for a class + subject + chapter
 * @param {string} cls
 * @param {string} subject
 * @param {string} chapter
 */
export function getTopics(cls, subject, chapter) {
  return (SYLLABUS[`class_${cls}`]?.[subject]?.[chapter]) || [];
}

/**
 * Helper: get the whole class object (matches API response shape)
 * Returns { SubjectName: { ChapterName: [topics] } }
 */
export function getClassData(cls) {
  return SYLLABUS[`class_${cls}`] || {};
}