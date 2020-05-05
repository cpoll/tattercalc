"use strict";

function roll_die(size){
    return 1 + Math.floor(Math.random() * size)
}

function calculate_damage(stats) {
    // Calculate damage for a single iteration
    // Returns [hit_dice_damage, wasted_damage, miss (bool)]

    const hit_roll = roll_die(20);

    // Check if we hit
    if(hit_roll > stats['STR'] - stats['DEFENDER_AC'] + stats['WEAPON_HIT_BONUS']){
        return [0, 0, true];
    }

    // Calculate base damage
    let damage = (
        roll_die(stats['WEAPON_DIE'])
        + Math.floor(stats['STR']/3)
        + stats['WEAPON_DAMAGE_BONUS']
        - 3
    )

    // Add crit damage
    if (hit_roll <= stats['CRIT']) {
        damage += roll_die(stats['WEAPON_DIE']);
    }

    // Calculate results
    const hit_dice_damage = Math.floor(damage/4)
    const wasted_damage = damage - hit_dice_damage * 4

    return [hit_dice_damage, wasted_damage, false]
}

function simulate_damage(stats) {

    let damage = 0;
    let wasted_damage = 0;
    let misses = 0;

    for(let i = 0; i < stats['SIM_ITERATIONS']; i++) {
        let [d, w, m] = calculate_damage(stats);
        damage += d;
        wasted_damage += w;
        misses += m;
    }

    return {
        'Average Damage (Dice)': damage / stats['SIM_ITERATIONS'],
        'Average Damage (Dice) (Hits Only)': damage / (stats['SIM_ITERATIONS'] - misses),
        'Miss%': (misses / stats['SIM_ITERATIONS']) * 100,
        'Average Wasted Damage': wasted_damage / stats['SIM_ITERATIONS'],
        'Average Wasted Damage (Dice Equiv)': wasted_damage / stats['SIM_ITERATIONS'] / 4,
        'Average Wasted Damage (Hits Only)': wasted_damage / (stats['SIM_ITERATIONS'] - misses),
        'Misses': misses,
        'Damage (Dice)': damage,
        'Wasted Damage': wasted_damage,
        'Wasted Damage (Dice equiv)': wasted_damage / 4,
    }

}

function calculate_damage_taken_at_resist_phase(stats) {
    // Calculate how much damage we take at the resist phase (post hit or relfex rolls)

    let resist_roll = roll_die(20);
    let damage = 0;

    // Critical failures keep hitting us
    while(resist_roll === 20) {
        damage += 1;
        resist_roll = roll_die(20);
    }

    // Check if we take damage
    if (resist_roll > stats['RESIST']) {
        damage += 1;
    }

    return damage;
}

function calculate_damage_taken_attacking(stats) {
    // Calculate damage taken for a single round, from a target you're attacking

    const hit_roll = roll_die(20);

    // If we hit, we don't take damage
    if(hit_roll <= stats['STR'] - stats['DEFENDER_AC'] + stats['WEAPON_HIT_BONUS']){
        return 0;
    }

    const damage = calculate_damage_taken_at_resist_phase(stats);

    return damage;

}

function calculate_damage_taken_shielding(stats) {
    // Calculate damage taken for a single round, from a target you're shielding

    // Take advantage on reflex roll
    const reflex_roll = Math.min(roll_die(20), roll_die(20));

    // If we critically fail the reflex, we take damage twice; 1/400 chance here
    if (reflex_roll === 20) {
        return calculate_damage_taken_at_resist_phase(stats) + calculate_damage_taken_at_resist_phase(stats);
    }
    else if(reflex_roll <= stats['REFLEX']){
        // If we reflex dodge, we don't take damage
        return 0;
    }

    return calculate_damage_taken_at_resist_phase(stats);

}

function calculate_damage_taken_passively(stats) {
    // Calculate damage taken for a single round, from a target you're not attacking

    const reflex_roll = roll_die(20);

    // If we critically fail the reflex, we take damage twice
    if (reflex_roll === 20) {
        return calculate_damage_taken_at_resist_phase(stats) + calculate_damage_taken_at_resist_phase(stats);
    }
    else if(reflex_roll <= stats['REFLEX']){
        // If we reflex dodge, we don't take damage
        return 0;
    }

    return calculate_damage_taken_at_resist_phase(stats);
}

function simulate_damage_taken_attacking(stats) {
    let damage = 0;

    for(let i = 0; i < stats['SIM_ITERATIONS']; i++) {
        damage += calculate_damage_taken_attacking(stats);
    }

    return {
        'Average Damage Taken (Attacking)': damage / stats['SIM_ITERATIONS'],
        'Damage Taken (Attacking)': damage,
    }
}

function simulate_damage_taken_shielding(stats) {
    let damage = 0;

    for(let i = 0; i < stats['SIM_ITERATIONS']; i++) {
        damage += calculate_damage_taken_shielding(stats);
    }

    return {
        'Average Damage Taken (Shielding)': damage / stats['SIM_ITERATIONS'],
        'Damage Taken (Shielding)': damage,
    }

}

function simulate_damage_taken_passively(stats) {
    let damage = 0;

    for(let i = 0; i < stats['SIM_ITERATIONS']; i++) {
        damage += calculate_damage_taken_passively(stats);
    }

    return {
        'Average Damage Taken (No attacking)': damage / stats['SIM_ITERATIONS'],
        'Damage Taken (No attacking)': damage,
    }

}

