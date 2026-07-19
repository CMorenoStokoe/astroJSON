export namespace NASA {
	// Exoplanet archive results schema as below but restricted to the most relevant fields for simulation
	export interface MinifiedExoplanetArchiveRecord {
		// Identity
		pl_name: string // Standardized planet name (e.g., 'Kepler-186 f')
		pl_letter: string // Planet designation letter (e.g., 'f')

		// Discovery metadata
		disc_pubdate: string // Discovery publication date (YYYY-MM)
		disc_method: string // Discovery method shorthand (e.g., 'tran')
		disc_refname: string // HTML string of the discovery reference paper
		dkin_flag: number // Discovery Kinetics flag (whether it was discovered by tis gravitational effect on its host)

		// Coordinates
		// Spherical coordinates
		ra: number // Right Ascension (Decimal Degrees, J2000)
		dec: number // Declination (Decimal Degrees, J2000)
		// Cartesian coordinates
		glon: number // Galactic Longitude (Degrees)
		glat: number // Galactic Latitude (Degrees)

		// Kinematics
		// Orbit - Keplerian elements
		pl_orbper: number // Orbital Period (Days)
		pl_orblper: number // Argument of Periastron (Degrees)
		pl_orbsmax: number // Orbit Semi-Major Axis (AU)
		pl_orbincl: number // Inclination (Degrees)
		pl_orbtper: number // Epoch of Periastron (Julian Date)
		pl_orbeccen: number // Eccentricity
		cb_flag: number // Circumbinary Flag (1 = orbits two stars, 0 = orbits one star)

		// Planetary details
		pl_eqt: number // Equilibrium Temperature (Kelvin)
		pl_occdep: number // Occultation Depth (%, degree of dimming when passes in front of star)
		pl_insol: number // Insolation Flux  (Earth Flux, reflection of stars light from planet)
		pl_dens: number // Planet Density useful for identifying planet type (g/cm³)
		pl_radj: number // Planet Radius for gas giants (Jupiter Radii)
		pl_rade: number // Planet Radius for rocky bodies (Earth Radii)
		pl_trueobliq: number // True Obliquity (Degrees)
		pl_bmassj: number // Best Mass for gas giants (Jupiter masses)
		pl_bmasse: number // Best Mass for rocky bodies (Earth masses)
		pl_ntranspec: number // Number of transmission spectra available (whether there is atmospheric composition data)

		// System/host data linkage keys
		hostname: string // Standardized host star name
		sy_name: string // System Name

		// 3D visualisation shorthand variables
		pl_ratdor: number // Ratio of Distance to Stellar Radius for 3D camera positioning
		pl_imppar: number // Impact Parameter (where the planet crosses the face of the star relative to the star's center from our point of view on Earth)
	}
	/**
	 * Architectural, positional, and kinematic data for the system as a whole.
	 * Use this as the structural anchor for a multi-body simulation instance.
	 */
	export interface MinifiedExoplanetArchiveSystemRecord {
		// --- IDENTIFIERS ---
		sy_name: string // System Name (unique key)
		systemid: string // System internal database ID

		// --- SYSTEM COMPOSITION ---
		sy_snum: number // Number of Stars in System
		sy_pnum: number // Number of Planets in System
		sy_mnum: number // Number of Moons in System
		cb_flag: number // Circumbinary flag (1 = planets orbit a binary pair)

		// --- SPHERICAL COORDINATES & DISTANCE ---
		ra: number // Right Ascension (Decimal Degrees, J2000)
		dec: number // Declination (Decimal Degrees, J2000)
		sy_dist: number // Distance to System (Parsecs)
		sy_plx: number // System Parallax (mas)

		// --- GALACTIC COORDINAES & INTEGRATION ---
		glon: number // Galactic Longitude (Degrees)
		glat: number // Galactic Latitude (Degrees)
		x: number // Galactocentric X position (Parsecs)
		y: number // Galactocentric Y position (Parsecs)
		z: number // Galactocentric Z position (Parsecs)

		// --- SYSTEM KINEMATICS ---
		sy_pm: number // Total System Proper Motion (mas/yr)
		sy_pmra: number // Proper Motion in Right Ascension (mas/yr)
		sy_pmdec: number // Proper Motion in Declination (mas/yr)

		// --- SYSTEM PHOTOMETRY (INTEGRATED SYSTEM LIGHT) ---
		sy_gaiamag: number // Gaia magnitude (Optical anchor)
		sy_tmag: number // TESS magnitude (Broad-red anchor fallback)
		sy_vmag: number // V-band magnitude (Visual fallback)
		sy_jmag: number // J-band magnitude (NIR)
		sy_kmag: number // K-band magnitude (NIR)
		sy_w1mag: number // WISE W1 magnitude (3.4 microns, star color)
		sy_w4mag: number // WISE W4 magnitude (22 microns, dust/disks)
	}

	/**
	 * Physical, spectral, and rotational properties of individual host stars.
	 * Link multiple star records to a single System Record using the sy_name key.
	 */
	export interface MinifiedExoplanetArchiveStarRecord {
		// --- IDENTIFIERS & PARENT KEY ---
		hostname: string // Standardized host star name
		hostid: string // IPAC internal host star ID
		sy_name: string // System Name (Foreign key linking to SystemRecord)

		// --- STELLAR CROSS-REFERENCES ---
		hd_name: string // Henry Draper Catalog name
		hip_name: string // Hipparcos Catalog name
		tic_id: string // TESS Input Catalog identifier
		gaia_dr3_id: string // Gaia Data Release 3 ID

		// --- PHYSICAL PARAMETERS ---
		st_spectype: string // Spectral Type classification (e.g., 'M1', 'G2V')
		st_teff: number // Effective Temperature (Kelvin)
		st_rad: number // Stellar Radius (Solar radii)
		st_mass: number // Stellar Mass (Solar masses)
		st_lum: number // Stellar Luminosity (log(L/L_sun))
		st_dens: number // Stellar Density (g/cm³)
		st_logg: number // Stellar Surface Gravity (log10(cm/s²))
		st_age: number // Stellar Age (Gigayears)

		// --- CHEMICAL COMPOSITION ---
		st_met: number // Stellar Metallicity
		st_metratio: string // Metallicity Ratio type (e.g., '[Fe/H]')

		// --- STELLAR KINEMATICS & ROTATION ---
		st_radv: number // Radial Velocity relative to barycenter (km/s)
		st_rotp: number // Stellar Rotation Period (Days)
		st_vsin: number // Projected Rotational Velocity [v sin(i)] (km/s)
		st_log_rhk: number // Stellar Chromospheric Activity index (log R'HK)
	}

	/**
	 * Exoplanet Archive 'pscomppars' Table Schema
	 * * Suffix Glossary for Base Variables:
	 * - err1 / err2 : Upper (+) and lower (-) statistical uncertainties.
	 * - symerr      : Flag (1 or 0) indicating if error bounds are symmetrical.
	 * - lim         : Flag indicating value type (0 = measured, 1 = upper limit, -1 = lower limit).
	 * - str         : Pre-formatted HTML string combining the value and its errors.
	 * - format      : Data formatting reference.
	 * - solnid      : Internal database ID for the specific mathematical solution used.
	 * - reflink     : HTML reference link to the source publication.
	 */
	interface ExoplanetArchiveRecord {
		// --- IDENTIFIERS & DISCOVERY METADATA ---
		objectid: string // IPAC internal database object ID
		pl_name: string // Standardized planet name (e.g., 'Kepler-186 f')
		pl_letter: string // Planet designation letter (e.g., 'f')
		hostid: string // IPAC internal host star ID
		hostname: string // Standardized host star name
		hd_name: string // Henry Draper Catalog name
		hip_name: string // Hipparcos Catalog name
		tic_id: string // TESS Input Catalog identifier
		disc_pubdate: string // Discovery publication date (YYYY-MM)
		disc_year: number // Discovery year
		disc_method: string // Discovery method shorthand (e.g., 'tran')
		discoverymethod: string // Discovery method full name (e.g., 'Transit')
		disc_locale: string // Discovery location (e.g., 'Space', 'Ground')
		disc_facility: string // Observatory or facility name
		disc_instrument: string // Specific instrument used
		disc_telescope: string // Specific telescope used
		disc_refname: string // HTML string of the discovery reference paper

		// --- ASTROMETRY & COORDINATES ---
		ra: number // Right Ascension (Decimal Degrees, J2000)
		raerr1: number
		raerr2: number
		rasymerr: number
		rastr: string
		ra_solnid: string
		ra_reflink: string

		dec: number // Declination (Decimal Degrees, J2000)
		decerr1: number
		decerr2: number
		decsymerr: number
		decstr: string
		dec_solnid: string
		dec_reflink: string

		glon: number // Galactic Longitude (Degrees)
		glonerr1: number
		glonerr2: number
		glonsymerr: number
		glonstr: string
		glon_solnid: string
		glon_reflink: string

		glat: number // Galactic Latitude (Degrees)
		glaterr1: number
		glaterr2: number
		glatsymerr: number
		glatstr: string
		glat_solnid: string
		glat_reflink: string

		elon: number // Ecliptic Longitude (Degrees)
		elonerr1: number
		elonerr2: number
		elonsymerr: number
		elonstr: string
		elon_solnid: string
		elon_reflink: string

		elat: number // Ecliptic Latitude (Degrees)
		elaterr1: number
		elaterr2: number
		elatsymerr: number
		elat_solnid: string
		elat_reflink: string
		elatstr: string

		// --- PLANETARY ORBITAL MECHANICS ---
		pl_orbper: number // Orbital Period (Days)
		pl_orbpererr1: number
		pl_orbpererr2: number
		pl_orbpersymerr: number
		pl_orbperlim: number
		pl_orbperstr: string | null
		pl_orbperformat: string | null
		pl_orbper_solnid: string | null
		pl_orbper_reflink: string | null

		pl_orblpererr1: number
		pl_orblper: number // Argument of Periastron (Degrees)
		pl_orblpererr2: number
		pl_orblpersymerr: number
		pl_orblperlim: number
		pl_orblperstr: string | null
		pl_orblperformat: string | null
		pl_orblper_solnid: string | null
		pl_orblper_reflink: string | null

		pl_orbsmax: number // Orbit Semi-Major Axis (AU)
		pl_orbsmaxerr1: number
		pl_orbsmaxerr2: number
		pl_orbsmaxsymerr: number
		pl_orbsmaxlim: number
		pl_orbsmaxstr: string | null
		pl_orbsmaxformat: string | null
		pl_orbsmax_solnid: string | null
		pl_orbsmax_reflink: string | null

		pl_orbincl: number // Inclination (Degrees)
		pl_orbinclerr1: number
		pl_orbinclerr2: number
		pl_orbinclsymerr: number
		pl_orbincllim: number
		pl_orbinclstr: string | null
		pl_orbinclformat: string | null
		pl_orbincl_solnid: string | null
		pl_orbincl_reflink: string | null

		pl_orbtper: number // Epoch of Periastron (Julian Date)
		pl_orbtpererr1: number
		pl_orbtpererr2: number
		pl_orbtpersymerr: number
		pl_orbtperlim: number
		pl_orbtperstr: string | null
		pl_orbtperformat: string | null
		pl_orbtper_solnid: string | null
		pl_orbtper_reflink: string | null

		pl_orbeccen: number // Eccentricity
		pl_orbeccenerr1: number
		pl_orbeccenerr2: number
		pl_orbeccensymerr: number
		pl_orbeccenlim: number
		pl_orbeccenstr: string | null
		pl_orbeccenformat: string | null
		pl_orbeccen_solnid: string | null
		pl_orbeccen_reflink: string | null

		// --- PLANETARY PHYSICAL CONDITIONS ---
		pl_eqt: number // Equilibrium Temperature (Kelvin)
		pl_eqterr1: number
		pl_eqterr2: number
		pl_eqtsymerr: number
		pl_eqtlim: number
		pl_eqtstr: string | null
		pl_eqtformat: string | null
		pl_eqt_solnid: string | null
		pl_eqt_reflink: string | null

		pl_occdep: number // Occultation Depth (%)
		pl_occdeperr1: number
		pl_occdeperr2: number
		pl_occdepsymerr: number
		pl_occdeplim: number
		pl_occdepstr: string | null
		pl_occdepformat: string | null
		pl_occdep_solnid: string | null
		pl_occdep_reflink: string | null

		pl_insol: number // Insolation Flux (Earth Flux)
		pl_insolerr1: number
		pl_insolerr2: number
		pl_insolsymerr: number
		pl_insollim: number
		pl_insolstr: string | null
		pl_insolformat: string | null
		pl_insol_solnid: string | null
		pl_insol_reflink: string | null

		pl_dens: number // Planet Density (g/cm³)
		pl_denserr1: number
		pl_denserr2: number
		pl_denssymerr: number
		pl_denslim: number
		pl_densstr: string | null
		pl_densformat: string | null
		pl_dens_solnid: string | null
		pl_dens_reflink: string | null

		// --- PHOTOMETRY (MAGNITUDES) ---
		sy_umagerr1: number
		sy_umagerr2: number
		sy_umaglim: number
		sy_umagsymerr: number
		sy_umagstr: string | null
		sy_umagformat: string | null
		sy_umag_solnid: string | null
		sy_umag_reflink: string | null

		sy_rmag: number // R-band magnitude
		sy_rmagerr1: number
		sy_rmagerr2: number
		sy_rmaglim: number
		sy_rmagsymerr: number
		sy_rmagstr: string | null
		sy_rmagformat: string | null
		sy_rmag_solnid: string | null
		sy_rmag_reflink: string | null

		sy_imag: number // i-band magnitude
		sy_imagerr1: number
		sy_imagerr2: number
		sy_imaglim: number
		sy_imagsymerr: number
		sy_imagstr: string | null
		sy_imagformat: string | null
		sy_imag_solnid: string | null
		sy_imag_reflink: string | null

		sy_zmag: number // z-band magnitude
		sy_zmagerr1: number
		sy_zmagerr2: number
		sy_zmaglim: number
		sy_zmagsymerr: number
		sy_zmagstr: string | null
		sy_zmagformat: string | null
		sy_zmag_solnid: string | null
		sy_zmag_reflink: string | null

		sy_w1mag: number // WISE W1 magnitude
		sy_w1magerr1: number
		sy_w1magerr2: number
		sy_w1maglim: number
		sy_w1magsymerr: number
		sy_w1magstr: string | null
		sy_w1magformat: string | null
		sy_w1mag_solnid: string | null
		sy_w1mag_reflink: string | null

		sy_w2mag: number // WISE W2 magnitude
		sy_w2magerr1: number
		sy_w2magerr2: number
		sy_w2maglim: number
		sy_w2magsymerr: number
		sy_w2magstr: string | null
		sy_w2magformat: string | null
		sy_w2mag_solnid: string | null
		sy_w2mag_reflink: string | null

		sy_w3mag: number // WISE W3 magnitude
		sy_w3magerr1: number
		sy_w3magerr2: number
		sy_w3maglim: number
		sy_w3magsymerr: number
		sy_w3magstr: string | null
		sy_w3magformat: string | null
		sy_w3mag_solnid: string | null
		sy_w3mag_reflink: string | null

		sy_w4mag: number // WISE W4 magnitude
		sy_w4magerr1: number
		sy_w4magerr2: number
		sy_w4maglim: number
		sy_w4magsymerr: number
		sy_w4magstr: string | null
		sy_w4magformat: string | null
		sy_w4mag_solnid: string | null
		sy_w4mag_reflink: string | null

		sy_gmag: number // Gaia G-band magnitude
		sy_gmagerr1: number
		sy_gmagerr2: number
		sy_gmaglim: number
		sy_gmagsymerr: number
		sy_gmagstr: string | null
		sy_gmagformat: string | null
		sy_gmag_solnid: string | null
		sy_gmag_reflink: string | null

		sy_gaiamag: number // Gaia magnitude
		sy_gaiamagerr1: number
		sy_gaiamagerr2: number
		sy_gaiamaglim: number
		sy_gaiamagsymerr: number
		sy_gaiamagstr: string | null
		sy_gaiamagformat: string | null
		sy_gaiamag_solnid: string | null
		sy_gaiamag_reflink: string | null

		sy_tmag: number // TESS magnitude
		sy_tmagerr1: number
		sy_tmagerr2: number
		sy_tmaglim: number
		sy_tmagsymerr: number
		sy_tmagstr: string | null
		sy_tmagformat: string | null
		sy_tmag_solnid: string | null
		sy_tmag_reflink: string | null

		// --- SYSTEM & STAR PROPERTIES ---
		sy_name: string // System Name
		pl_controv_flag: number // Controversial flag (1 = disputed confirmation)
		pl_orbtper_systemref: string | null
		pl_tranmid_systemref: string | null
		st_metratio: string // Metallicity Ratio type (e.g., [Fe/H])
		st_spectype: string // Spectral Type (e.g., M1, G2V)
		st_spectype_solnid: string | null
		st_spectype_reflink: string | null
		sy_plxlim: number

		sy_kepmag: number // Kepler band magnitude
		sy_kepmagerr1: number
		sy_kepmagerr2: number
		sy_kepmaglim: number
		sy_kepmagsymerr: number
		sy_kepmagstr: string | null
		sy_kepformat: string | null
		sy_kepmag_solnid: string | null
		sy_kepmag_reflink: string | null

		st_rotp: number // Stellar Rotation Period (Days)
		st_rotperr1: number
		st_rotperr2: number
		st_rotpsymerr: number
		st_rotplim: number
		st_rotpstr: string | null
		st_rotpformat: string | null
		st_rotp_solnid: string | null
		st_rotp_reflink: string | null

		// --- EXTENDED PLANETARY MEASUREMENTS ---
		pl_projobliq: number // Projected Obliquity (Degrees)
		pl_projobliqerr1: number
		pl_projobliqerr2: number
		pl_projobliqsymerr: number
		pl_projobliqlim: number
		pl_projobliqstr: string | null
		pl_projobliqformat: string | null

		pl_trandep: number // Transit Depth (%)
		pl_trandeperr1: number
		pl_trandeperr2: number
		pl_trandepsymerr: number
		pl_trandeplim: number
		pl_trandepstr: string | null
		pl_trandepformat: string | null
		pl_trandep_solnid: string | null
		pl_trandep_reflink: string | null

		pl_tranmid: number // Transit Midpoint (Julian Date)
		pl_tranmiderr1: number
		pl_tranmiderr2: number
		pl_tranmidsymerr: number
		pl_tranmidlim: number
		pl_tranmidstr: string | null
		pl_tranmidformat: string | null
		pl_tranmid_solnid: string | null
		pl_tranmid_reflink: string | null

		pl_trandur: number // Transit Duration (Hours)
		pl_trandurerr1: number
		pl_trandurerr2: number
		pl_trandursymerr: number
		pl_trandurlim: number
		pl_trandurstr: string | null
		pl_trandurformat: string | null
		pl_trandur_solnid: string | null
		pl_trandur_reflink: string | null

		pl_rvamp: number // Radial Velocity Amplitude (m/s)
		pl_rvamperr1: number
		pl_rvamperr2: number
		pl_rvampsymerr: number
		pl_rvamplim: number
		pl_rvampstr: string | null
		pl_rvampformat: string | null
		pl_rvamp_solnid: string | null
		pl_rvamp_reflink: string | null

		pl_radj: number // Planet Radius (Jupiter Radii)
		pl_radjerr1: number
		pl_radjerr2: number
		pl_radjsymerr: number
		pl_radjlim: number
		pl_radjstr: string | null
		pl_radjformat: string | null
		pl_radj_solnid: string | null
		pl_radj_reflink: string | null

		pl_rade: number // Planet Radius (Earth Radii)
		pl_radeerr1: number
		pl_radeerr2: number
		pl_radesymerr: number
		pl_radelim: number
		pl_radestr: string | null
		pl_radeformat: string | null
		pl_rade_solnid: string | null
		pl_rade_reflink: string | null

		pl_ratror: number // Ratio of Planet to Stellar Radius
		pl_ratrorerr1: number
		pl_ratrorerr2: number
		pl_ratrorsymerr: number
		pl_ratrorlim: number
		pl_ratrorstr: string | null
		pl_ratrorformat: string | null
		pl_ratror_solnid: string | null
		pl_ratror_reflink: string | null

		pl_ratdor: number // Ratio of Distance to Stellar Radius
		pl_ratdorerr1: number
		pl_ratdorerr2: number
		pl_ratdorsymerr: number
		pl_ratdorlim: number
		pl_ratdorstr: string | null
		pl_ratdorformat: string | null
		pl_ratdor_solnid: string | null
		pl_ratdor_reflink: string | null

		pl_trueobliq: number // True Obliquity (Degrees)
		pl_trueobliqerr1: number
		pl_trueobliqerr2: number
		pl_trueobliqsymerr: number
		pl_trueobliqlim: number
		pl_trueobliqstr: string | null
		pl_trueobliqformat: string | null
		pl_trueobliq_solnid: string | null
		pl_trueobliq_reflink: string | null

		// --- EXTENDED STELLAR MEASUREMENTS ---
		st_log_rhk: number // Stellar Chromospheric Activity (log R'HK)
		st_log_rhkerr1: number
		st_log_rhkerr2: number
		st_log_rhksymerr: number
		st_log_rhklim: number
		st_log_rhkstr: string | null
		st_log_rhkformat: string | null
		st_log_rhk_solnid: string | null
		st_log_rhk_reflink: string | null

		st_metn: number // Number of Stellar Metallicity Measurements

		sy_icmag: number // Cousins I-band magnitude
		sy_icmagerr1: number
		sy_icmagerr2: number
		sy_icmagsymerr: number
		sy_icmagstr: string | null
		sy_icmagformat: string | null
		sy_icmag_solnid: string | null
		sy_icmag_reflink: string | null

		pl_pubdate: string // Planet data publication date
		dkin_flag: number // Discovery Kinetics flag

		pl_imppar: number // Impact Parameter
		pl_impparerr1: number
		pl_impparerr2: number
		pl_impparsymerr: number
		pl_impparlim: number
		pl_impparstr: string | null
		pl_impparformat: string | null
		pl_imppar_solnid: string | null
		pl_imppar_reflink: string | null

		// --- PLANET MASS MEASUREMENTS ---
		pl_cmassj: number // Calculated Mass (Jupiter masses)
		pl_cmassjerr1: number
		pl_cmassjerr2: number
		pl_cmassjsymerr: number
		pl_cmassjlim: number
		pl_cmassjstr: string | null
		pl_cmassjformat: string | null
		pl_cmassj_solnid: string | null
		pl_cmassj_reflink: string | null

		pl_cmasse: number // Calculated Mass (Earth masses)
		pl_cmasseerr1: number
		pl_cmasseerr2: number
		pl_cmassesymerr: number
		pl_cmasselim: number
		pl_cmassestr: string | null
		pl_cmasseformat: string | null
		pl_cmasse_solnid: string | null
		pl_cmasse_reflink: string | null

		pl_massj: number // Measured Mass (Jupiter masses)
		pl_massjerr1: number
		pl_massjerr2: number
		pl_massjsymerr: number
		pl_massjlim: number
		pl_massjstr: string | null
		pl_massjformat: string | null
		pl_massj_solnid: string | null
		pl_massj_reflink: string | null

		pl_masse: number // Measured Mass (Earth masses)
		pl_masseerr1: number
		pl_masseerr2: number
		pl_massesymerr: number
		pl_masselim: number
		pl_massestr: string | null
		pl_masseformat: string | null
		pl_masse_solnid: string | null
		pl_masse_reflink: string | null

		pl_bmassj: number // Best Mass (Jupiter masses)
		pl_bmassjerr1: number
		pl_bmassjerr2: number
		pl_bmassjsymerr: number
		pl_bmassjlim: number
		pl_bmassjstr: string | null
		pl_bmassjformat: string | null
		pl_bmassj_solnid: string | null
		pl_bmassj_reflink: string | null

		pl_bmasse: number // Best Mass (Earth masses)
		pl_bmasseerr1: number
		pl_bmasseerr2: number
		pl_bmassesymerr: number
		pl_bmasselim: number
		pl_bmassestr: string | null
		pl_bmasseformat: string | null
		pl_bmasse_solnid: string | null
		pl_bmasse_reflink: string | null
		pl_bmassprov: string // Best Mass Provenance (e.g., 'M-R relationship')

		pl_msinij: number // Minimum Mass [m sin(i)] (Jupiter masses)
		pl_msinijerr1: number
		pl_msinijerr2: number
		pl_msinijsymerr: number
		pl_msinijlim: number
		pl_msinijstr: string | null
		pl_msinijformat: string | null
		pl_msinij_solnid: string | null
		pl_msinij_reflink: string | null

		pl_msinie: number // Minimum Mass [m sin(i)] (Earth masses)
		pl_msinieerr1: number
		pl_msinieerr2: number
		pl_msiniesymerr: number
		pl_msinielim: number
		pl_msiniestr: string | null
		pl_msinieformat: string | null
		pl_msinie_solnid: string | null
		pl_msinie_reflink: string | null

		// --- CORE STELLAR PARAMETERS ---
		st_teff: number // Effective Temperature (Kelvin)
		st_tefferr1: number
		st_tefferr2: number
		st_teffsymerr: number
		st_tefflim: number
		st_teffstr: string | null
		st_teffformat: string | null
		st_teff_solnid: string | null
		st_teff_reflink: string | null

		st_met: number // Stellar Metallicity
		st_meterr1: number
		st_meterr2: number
		st_metsymerr: number
		st_metlim: number
		st_metstr: string | null
		st_metformat: string | null
		st_met_solnid: string | null
		st_met_reflink: string | null

		st_radv: number // System Radial Velocity (km/s)
		st_radverr1: number
		st_radverr2: number
		st_radvsymerr: number
		st_radvlim: number
		st_radvstr: string | null
		st_radvformat: string | null
		st_radv_solnid: string | null
		st_radv_reflink: string | null

		st_vsin: number // Projected Rotational Velocity [v sin(i)] (km/s)
		st_vsinerr1: number
		st_vsinerr2: number
		st_vsinsymerr: number
		st_vsinlim: number
		st_vsinstr: string | null
		st_vsin_solnid: string | null
		st_vsin_reflink: string | null
		st_vsinformat: string | null

		st_lum: number // Stellar Luminosity (log(L/L_sun))
		st_lumerr1: number
		st_lumerr2: number
		st_lumsymerr: number
		st_lumlim: number
		st_lumstr: string | null
		st_lumformat: string | null
		st_lum_solnid: string | null
		st_lum_reflink: string | null

		st_logg: number // Stellar Surface Gravity (log10(cm/s²))
		st_loggerr1: number
		st_loggerr2: number
		st_loggsymerr: number
		st_logglim: number
		st_loggstr: string | null
		st_loggformat: string | null
		st_logg_solnid: string | null
		st_logg_reflink: string | null

		st_age: number // Stellar Age (Gigayears)
		st_ageerr1: number
		st_ageerr2: number
		st_agesymerr: number
		st_agelim: number
		st_agestr: string | null
		st_ageformat: string | null
		st_age_solnid: string | null
		st_age_reflink: string | null

		st_mass: number // Stellar Mass (Solar masses)
		st_masserr1: number
		st_masserr2: number
		st_masssymerr: number
		st_masslim: number
		st_massstr: string | null
		st_massformat: string | null
		st_mass_solnid: string | null
		st_mass_reflink: string | null

		st_dens: number // Stellar Density (g/cm³)
		st_denserr1: number
		st_denserr2: number
		st_denssymerr: number
		st_denslim: number
		st_densstr: string | null
		st_densformat: string | null
		st_dens_solnid: string | null
		st_dens_reflink: string | null

		st_rad: number // Stellar Radius (Solar radii)
		st_raderr1: number
		st_raderr2: number
		st_radsymerr: number
		st_radlim: number
		st_radstr: string | null
		st_radformat: string | null
		st_rad_solnid: string | null
		st_rad_reflink: string | null

		// --- SYSTEM TOTALS & DETECTION FLAGS ---
		systemid: string // System internal ID
		ttv_flag: number // Detected via Transit Timing Variations
		ptv_flag: number // Pulsation Timing Variations flag
		tran_flag: number // Detected via Transit
		rv_flag: number // Detected via Radial Velocity
		ast_flag: number // Detected via Astrometry
		obm_flag: number // Orbital Brightness Modulation flag
		micro_flag: number // Detected via Microlensing
		etv_flag: number // Eclipse Timing Variations flag
		ima_flag: number // Detected via Direct Imaging
		pul_flag: number // Pulsar Timing flag
		disc_refid: number // Discovery publication reference ID

		sy_snum: number // Number of Stars in System
		sy_pnum: number // Number of Planets in System
		sy_mnum: number // Number of Moons in System

		st_nphot: number // Number of photometric measurements
		st_nrvc: number // Number of radial velocity measurements
		st_nspec: number // Number of spectra available
		pl_nespec: number // Number of emission spectra available
		pl_ntranspec: number // Number of transmission spectra available
		pl_nnotes: number // Number of public notes/comments on the planet

		// --- PROPER MOTION & DISTANCE ---
		sy_pm: number // Total Proper Motion (mas/yr)
		sy_pmerr1: number
		sy_pmerr2: number
		sy_pmsymerr: number
		sy_pmlim: number
		sy_pmstr: string | null
		sy_pmformat: string | null
		sy_pm_solnid: string | null
		sy_pm_reflink: string | null

		sy_pmra: number // Proper Motion in Right Ascension (mas/yr)
		sy_pmraerr1: number
		sy_pmraerr2: number
		sy_pmrasymerr: number
		sy_pmralim: number
		sy_pmrastr: string | null
		sy_pmraformat: string | null
		sy_pmra_solnid: string | null
		sy_pmra_reflink: string | null

		sy_pmdec: number // Proper Motion in Declination (mas/yr)
		sy_pmdecerr1: number
		sy_pmdecerr2: number
		sy_pmdecsymerr: number
		sy_pmdeclim: number
		sy_pmdecstr: string | null
		sy_pmdecformat: string | null
		sy_pmdec_solnid: string | null
		sy_pmdec_reflink: string | null

		sy_plx: number // System Parallax (mas)
		sy_plxerr1: number
		sy_plxerr2: number
		sy_plxsymerr: number
		sy_plxstr: string | null
		sy_plxformat: string | null
		sy_plx_solnid: string | null
		sy_plx_reflink: string | null

		sy_dist: number // Distance to System (Parsecs)
		sy_disterr1: number
		sy_disterr2: number
		sy_distsymerr: number
		sy_distlim: number
		sy_diststr: string | null
		sy_distformat: string | null
		sy_dist_solnid: string | null
		sy_dist_reflink: string | null

		// --- ADDITIONAL PHOTOMETRY ---
		sy_bmag: number // B-band magnitude
		sy_bmagerr1: number
		sy_bmagerr2: number
		sy_bmaglim: number
		sy_bmagsymerr: number
		sy_bmagstr: string | null
		sy_bmagformat: string | null
		sy_bmag_solnid: string | null
		sy_bmag_reflink: string | null

		sy_vmag: number // V-band (Visual) magnitude
		sy_vmagerr1: number
		sy_vmagerr2: number
		sy_vmaglim: number
		sy_vmagsymerr: number
		sy_vmagstr: string | null
		sy_vmagformat: string | null
		sy_vmag_solnid: string | null
		sy_vmag_reflink: string | null

		sy_jmag: number // J-band magnitude
		sy_jmagerr1: number
		sy_jmagerr2: number
		sy_jmaglim: number
		sy_jmagsymerr: number
		sy_jmagstr: string | null
		sy_jmagformat: string | null
		sy_jmag_solnid: string | null
		sy_jmag_reflink: string | null

		sy_hmag: number // H-band magnitude
		sy_hmagerr1: number
		sy_hmagerr2: number
		sy_hmaglim: number
		sy_hmagsymerr: number
		sy_hmagstr: string | null
		sy_hmagformat: string | null
		sy_hmag_solnid: string | null
		sy_hmag_reflink: string | null

		sy_kmag: number // K-band magnitude
		sy_kmagerr1: number
		sy_kmagerr2: number
		sy_kmaglim: number
		sy_kmagsymerr: number
		sy_kmagstr: string | null
		sy_kmagformat: string | null
		sy_kmag_solnid: string | null
		sy_kmag_reflink: string | null

		sy_umag: number // U-band magnitude

		pl_projobliq_solnid: string | null
		pl_projobliq_reflink: string | null

		// --- BARYCENTRIC CARTESIAN COORDINATES ---
		x: number // Galactocentric X position (Parsecs)
		y: number // Galactocentric Y position (Parsecs)
		z: number // Galactocentric Z position (Parsecs)

		// --- CROSS-MATCHING & SEPARATION ---
		htm20: number // Hierarchical Triangular Mesh level 20 ID
		gaia_dr2_id: string // Gaia Data Release 2 ID
		gaia_dr3_id: string // Gaia Data Release 3 ID
		cb_flag: number // Circumbinary flag (1 = orbits two stars)

		pl_angsep: number // Angular Separation (arcseconds)
		pl_angseperr1: number
		pl_angseperr2: number
		pl_angseplim: number
		pl_angsepformat: string | null
		pl_angsepstr: string | null
		pl_angsepsymerr: number
		pl_angsep_reflink: string | null

		pl_ndispec: number // Number of direct imaging spectra
	}

	// # NASA Horizons
	export type MinifiedHorizonsSystemRecord = Pick<
		MinifiedExoplanetArchiveSystemRecord,
		| 'sy_name'
		| 'sy_snum'
		| 'sy_pnum'
		| 'sy_mnum'
		| 'cb_flag'
		| 'ra'
		| 'dec'
		| 'glon'
		| 'glat'
		| 'sy_dist'
		| 'sy_plx'
		| 'sy_pm'
		| 'sy_pmra'
		| 'sy_pmdec'
		| 'sy_gaiamag'
		| 'sy_tmag'
		| 'sy_vmag'
		| 'sy_jmag'
		| 'sy_kmag'
		| 'sy_w1mag'
		| 'sy_w4mag'
	>

	export type MinifiedHorizonsStarRecord = Pick<
		MinifiedExoplanetArchiveStarRecord,
		| 'hostname'
		| 'hostid'
		| 'sy_name'
		| 'hd_name'
		| 'hip_name'
		| 'tic_id'
		| 'gaia_dr3_id'
		| 'st_spectype'
		| 'st_teff'
		| 'st_rad'
		| 'st_mass'
		| 'st_lum'
		| 'st_dens'
		| 'st_logg'
		| 'st_age'
		| 'st_met'
		| 'st_metratio'
		| 'st_radv'
		| 'st_rotp'
		| 'st_vsin'
		| 'st_log_rhk'
	>
}
