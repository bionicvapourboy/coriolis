angular.module('app').config(['$translateProvider', 'localeFormatProvider', function($translateProvider, localeFormatProvider) {
  // Declare number format settings
  localeFormatProvider.addFormat('fr', {
    decimal: ',',
    thousands: '.',
    grouping: [3],
    currency: ['', ' €'],
    dateTime: '%A, le %e %B %Y, %X',
    date: '%d/%m/%Y',
    time: '%H:%M:%S',
    periods: ['AM', 'PM'], // unused
    days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    shortDays: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
    months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    shortMonths: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  });
  $translateProvider.translations('fr', {
    PHRASE_EXPORT_DESC: 'Un export détaillé en JSON de votre configuration pour l\'utilisation dans d\'autres sites et outils',
    'A-Rated': 'Classe-A ',
    about: 'à propos',
    added: 'ajouté',
    Advanced: 'Avancé',
    'Advanced Discovery Scanner': 'Scanner de découverte avancé',
    agility: 'agilité',
    ammo: 'munition',
    PHRASE_CONFIRMATION: 'Êtes-vous sûr?',
    armour: 'Armure',
    am: 'Unité de réparation automatique',
    available: 'Disponibilité',
    backup: 'sauvegarde',
    'Basic Discovery Scanner': 'Scanner de découverte de base',
    bl: 'Laser rayon',
    bins: 'bacs',
    build: 'Configuration',
    'build name': 'Nom de la configuration',
    builds: 'Configurations',
    bh: 'Coque',
    ul: 'Laser salves',
    buy: 'Acheter',
    cancel: 'Annuler',
    c: 'Canon',
    cargo: 'Soute',
    'Cargo Hatch': 'hublot de chargement',
    cr: 'Compartiment de soute',
    cs: 'Scanner de soute',
    cells: 'Cellule',
    'Chaff Launcher': 'Lanceur de paillettes',
    close: 'fermer',
    cc: 'Contrôleur de prospecteur',
    compare: 'comparer',
    'compare all': 'tout comparer',
    comparison: 'comparaison',
    comparisons: 'comparaisons',
    component: 'composant',
    cost: 'coût',
    costs: 'coûts',
    cm: 'Contre-mesure',
    create: 'Créer',
    'create new': 'Créer nouveau',
    credits: 'crédits',
    damage: 'Dégâts',
    delete: 'supprimer',
    'delete all': 'tout supprimer',
    dep: 'depl',
    deployed: 'déployé',
    'detailed export': 'export détaillé',
    'Detailed Surface Scanner': 'Scanner de surface détaillé',
    disabled: 'désactivé',
    discount: 'ristourne',
    Distruptor: 'Disrupteur',
    dc: 'Ordinateur d\'appontage',
    done: 'Fait',
    'edit data': 'Editer donnée',
    efficiency: 'efficience',
    'Electronic Countermeasure': 'Contre mesure électronique',
    empty: 'Vide',
    'enter name': 'Entrer nom',
    fixed: 'fixé',
    fc: 'Canon à fragmentation',
    fd: 'Réacteur FSD',
    ws: 'Détecteur de sillage FSD',
    fi: 'Intercepteur de réacteur FSD',
    fuel: 'carburant',
    fs: 'Récupérateur de carburant',
    ft: 'Réservoir de carburant',
    fx: 'Drone de ravitaillement',
    'full tank': 'Réservoir plein',
    Gimballed: 'Point',
    hardpoints: 'Points d\'emport',
    hb: 'Contrôle de patelle perce-soute',
    'Heat Sink Launcher': 'Ejecteur de dissipateur thermique',
    huge: 'Très grand',
    hull: 'Coque',
    hr: 'Renfort de soute',
    'Imperial Hammer': 'Marteau impérial',
    import: 'Importer',
    'import all': 'Importer tout',
    insurance: 'Assurance',
    'Intermediate Discovery Scanner': 'Scanner de découverte de portée intermédiaire',
    'internal compartments': 'compartiments internes',
    'jump range': 'Distance de saut',
    jumps: 'Sauts',
    kw: 'Détecteur d\'avis de recherche',
    L: 'Langage',
    laden: 'chargé',
    language: 'Langage',
    large: 'grand',
    ls: 'Support vital',
    'Lightweight Alloy': 'alliage léger',
    'lock factor': 'facteur inhibition de masse',
    LS: 'SL',
    LY: 'AL',
    mass: 'Masse',
    'max mass': 'masse max',
    'Military Grade Composite': 'Composite militaire',
    nl: 'Lance-mines',
    'Mining Lance': 'Lance de minage',
    ml: 'Laser minier',
    'Mirrored Surface Composite': 'Composite à surface mirroir',
    mr: 'Lance missiles',
    mc: 'Canon multiple',
    'net cost': 'coûts nets',
    no: 'non',
    PHRASE_NO_BUILDS: 'Défaut de configuration pour comparaison',
    PHRASE_NO_RETROCH: 'configuration non modifiée',
    none: 'aucun',
    'none created': 'Rien de créé',
    off: 'éteint',
    on: 'allumé',
    'optimal mass': 'masse optimale',
    'optimize mass': 'optimiser masse',
    overwrite: 'écraser',
    Pacifier: 'Pacificateur',
    PHRASE_IMPORT: 'Coller JSON ou importer ici',
    pen: 'pén.',
    penetration: 'pénétration',
    permalink: 'lien durable',
    pa: 'accélérateur plasma',
    'Point Defence': 'Défense ponctuelle',
    power: 'énergie',
    pd: 'distributeur d\'énérgie',
    pp: 'centrale d\'énergie',
    priority: 'priorité',
    psg: 'générateur de bouclier prisme',
    proceed: 'continuer',
    pc: 'Drône de minage',
    pl: 'Laser à impulsion',
    PWR: 'Puissance',
    rg: 'Canon électromagnétique',
    range: 'portée',
    rate: 'cadence',
    'Reactive Surface Composite': 'Composite à surface réactive',
    recharge: 'recharger',
    rf: 'Raffinerie',
    'refuel time': 'Temps de remplissage',
    'Reinforced Alloy': 'alliage renforcé',
    reload: 'recharger',
    rename: 'renommer',
    repair: 'réparer',
    reset: 'Réinitialisation',
    ret: 'esc',
    retracted: 'escamoté',
    'retrofit costs': 'Valeur de rachat',
    'retrofit from': 'Racheter de',
    ROF: 'cadence',
    save: 'sauvegarder',
    sc: 'scanner',
    PHRASE_SELECT_BUILDS: 'Sélectionner configurations à comparer',
    sell: 'vendre',
    s: 'détecteurs',
    settings: 'paramètres',
    sb: 'Survolteur de bouclier',
    scb: 'Réserve de cellules d\'énergie',
    sg: 'Générateur de bouclier',
    shields: 'boucliers',
    ship: 'vaisseau',
    ships: 'vaisseaux',
    shortened: 'raccourci',
    size: 'taille',
    skip: 'Suivant',
    small: 'petit',
    speed: 'vitesse',
    'Standard Docking Computer': 'ordinateur amarrage standard',
    Stock: 'de base',
    T_LOAD: 'degrés',
    'The Retributor': 'Le Rétributeur',
    t: 'propulseurs',
    time: 'temps',
    tp: 'Tube lance-torpille',
    'total range': 'Distance maximale',
    turret: 'tourelle',
    unladen: 'Non chargé',
    PHRASE_UPDATE_RDY: 'Mise à jour disponible ! Cliquez pour rafraichir',
    utility: 'utilitaire',
    'utility mounts': 'Support utilitaire',
    WEP: 'ARM',
    yes: 'oui',
    PHRASE_BACKUP_DESC: 'Exportation détaillée des données Coriolis pour l\'utilisation dans d\'autres sites et outils'
  });
}]);
