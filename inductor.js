// Global constants:
const mu0 = Math.PI * 4e-7;
const cu_sigma = 58e6;      // Copper conductance value

function dcResistance(loop_diameter_meters, cond_diameter_meters, spacing_ratio, loop_turns) {
    const cond_radius_meters = 0.5 * cond_diameter_meters;
    const c_spacing = spacing_ratio * cond_diameter_meters;
    const corr_factor = Math.sqrt(1.0 + (c_spacing**2 / loop_diameter_meters**2));
    const conductor_length = Math.PI * loop_diameter_meters * loop_turns * corr_factor;
    const conductor_area = Math.PI * (cond_radius_meters**2.0);
    return 1.68e-8 * conductor_length / conductor_area;
}

function skinDepth(frequency_hz) {
    return Math.sqrt(1.0 / (Math.PI * frequency_hz * mu0 * cu_sigma));
}

// From Knight "Solenoid Impedance and Q"
function dc2acFactor(cond_diameter_meters, skin_depth) {
    return cond_diameter_meters**2 / (4.0 * (cond_diameter_meters * skin_depth - skin_depth**2));
}

function getInductance(loop_diameter_meters, cond_diameter_meters, spacing_ratio, loop_turns) {
    const a_coil_radius = loop_diameter_meters * 0.5;
    //const b_conductor_radius = cond_diameter_meters * 0.5;
    const coil_length = cond_diameter_meters * spacing_ratio * loop_turns;
    var retval = (loop_turns**2.0) * mu0 * Math.PI * (a_coil_radius**2.0) * nagaokaCoefficient(loop_diameter_meters, cond_diameter_meters, spacing_ratio, loop_turns) / coil_length;
    return retval; // In Henries
}

function inductiveReactance(frequency, inductance) {
    return 2.0 * Math.PI * frequency * inductance; // In Ohms
}

function nagaokaCoefficient(loop_diameter_meters, cond_diameter_meters, spacing_ratio, loop_turns) {
    // From Knight's 2016 paper on coil self-resonance, attributed to Wheeler's 1982 eqn as modified by Bob Weaver
    const c_spacing = spacing_ratio * cond_diameter_meters;
    const x = loop_diameter_meters / (c_spacing * loop_turns);
    const zk = 2.0 / (Math.PI * x);
    const k0 = 1.0 / (Math.log(8.0 / Math.PI) - 0.5);
    const k2 = 24.0 / (3.0 * Math.PI**2 - 16.0);
    const w = -0.47 / (0.755 + x)**1.44;
    const p = k0 + 3.437/x + k2/x**2 + w;
    var retval = zk * (Math.log(1 + 1/zk) + 1/p);
    return retval;
}

function ctdw(ff, ei, ex, kL) {
    // From Knight's 2016 paper
    //const kL = nagaokaCoefficient(loop_diameter_meters, cond_diameter_meters, spacing_ratio, loop_turns);
    const kct = 1.0/kL - 1.0;
    return 11.27350207 * ex * ff * (1.0 + kct * (1.0 + ei/ex) / 2.0);
}

function ciae(ff, ei, ex) {
    // From Knight's 2016 paper
    return 17.70837564 * (ei+ex) / Math.log(1.0 + Math.PI**2 * ff);
}

function multiloopCapacitance(loop_diameter_meters, cond_diameter_meters, spacing_ratio, loop_turns) {
    const e0 =  8.854187e-12;
    const h = spacing_ratio * cond_diameter_meters;
    const ei = 1.0; // Assume internal epsilon is air (or free-space)
    const ex = 1.0; // Assume external epsilon is air (or free-space)
    const solenoid_length = 1.0 * loop_turns * h;
    const ff = solenoid_length / loop_diameter_meters;
    const kL = nagaokaCoefficient(loop_diameter_meters, cond_diameter_meters, spacing_ratio, loop_turns);
    var multiloop_capacitance = 1e-12 * (ctdw(ff, ei, ex, kL) / Math.sqrt(1 - h**2 / loop_diameter_meters**2) + ciae(ff, ei, ex)) * loop_diameter_meters;
    return multiloop_capacitance; // in Farads
}

const proximityResistance = [
    // From R.G. Medhurst H.F. Resistance and Self-Capacitance of Single-Layer Solenoids (Feb, 1947)
    [  0.0, 1.0, 1.111, 1.25, 1.429, 1.667, 2.0, 2.5, 3.333, 5.00, 10.0 ],
    [  0.0, 5.31, 3.73,  2.74, 2.12, 1.74, 1.44, 1.20, 1.16, 1.07, 1.02 ],
    [  0.2, 5.45, 3.84,  2.83, 2.20, 1.77, 1.48, 1.29, 1.19, 1.08, 1.02 ],
    [  0.4, 5.65, 3.99,  2.97, 2.28, 1.83, 1.54, 1.33, 1.21, 1.08, 1.03 ],
    [  0.6, 5.80, 4.11,  3.10, 2.38, 1.89, 1.60, 1.38, 1.22, 1.10, 1.03 ],
    [  0.8, 5.80, 4.17,  3.20, 2.44, 1.92, 1.64, 1.42, 1.23, 1.10, 1.03 ],
    [  1.0, 5.55, 4.10,  3.17, 2.47, 1.94, 1.67, 1.45, 1.24, 1.10, 1.03 ],
    [  2.0, 4.10, 3.36,  2.74, 2.32, 1.98, 1.74, 1.50, 1.28, 1.13, 1.04 ],
    [  4.0, 3.54, 3.05,  2.60, 2.27, 2.01, 1.78, 1.54, 1.32, 1.15, 1.04 ],
    [  6.0, 3.31, 2.92,  2.60, 2.29, 2.03, 1.80, 1.56, 1.34, 1.16, 1.04 ],
    [  8.0, 3.20, 2.90,  2.62, 2.34, 2.08, 1.81, 1.57, 1.34, 1.165, 1.04],
    [ 10.0, 3.23, 2.93,  2.65, 2.37, 2.10, 1.83, 1.58, 1.35, 1.17, 1.04 ],
    [999.0, 3.41, 3.11, 2.815, 2.51, 2.22, 1.93, 1.65, 1.395, 1.19, 1.05]
];

function getProximityResFromSpacing(loop_diameter_meters, cond_diameter_meters, spacing_ratio, loop_turns) {
    // Use the proximityResistance look-up table and interpolate values depending on the spacing ratio and the number of turns.
    var retval = 0.0;
    const length_diameter_ratio = loop_turns * spacing_ratio * cond_diameter_meters / loop_diameter_meters;
    var i = 0; // Going to the right, which is the spacing ratio
    var j = 0; // Going down the page, which is the solenoid length to diameter ratio
    for (i = 1; i < (proximityResistance[0].length); i++) {
        if(spacing_ratio < proximityResistance[0][i]) {
            i--;
            break;
        }
    }
    for (j = 1; j < (proximityResistance.length); j++) {
        if(length_diameter_ratio < proximityResistance[j][0]) {
            j--;
            break;
        }
    }
    var t1 = ((spacing_ratio - proximityResistance[0][i]) / (proximityResistance[0][i+1] - proximityResistance[0][i])) * (proximityResistance[j][i+1] - proximityResistance[j][i]) + proximityResistance[j][i];
    var t2 = ((spacing_ratio - proximityResistance[0][i]) / (proximityResistance[0][i+1] - proximityResistance[0][i])) * (proximityResistance[j+1][i+1] - proximityResistance[j+1][i]) + proximityResistance[j+1][i];
    retval = ((length_diameter_ratio - proximityResistance[j][0])/(proximityResistance[j+1][0] - proximityResistance[j][0])) * (t2 - t1) + t1;
    return retval;
}

function acResistance(loop_diameter_meters, cond_diameter_meters, spacing_ratio, loop_turns, frequency_hz) {
    const Rdc = dcResistance(loop_diameter_meters, cond_diameter_meters, spacing_ratio, loop_turns);
    const dc2ac = dc2acFactor(cond_diameter_meters, skinDepth(frequency_hz));
    const prox = getProximityResFromSpacing(loop_diameter_meters, cond_diameter_meters, spacing_ratio, loop_turns);
    return Rdc * dc2ac * prox;
}

function qualityFactor(reactance, resistance) {
    return reactance/resistance;
}

function selfResonantFrequency(inductance, capacitance) {
    var freq = 1.0 / (2.0 * Math.PI * Math.sqrt(inductance * capacitance));
    return freq;
}
