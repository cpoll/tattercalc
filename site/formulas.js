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
    const damage = (
        roll_die(stats['WEAPON_DIE'])
        + Math.floor(stats['STR']/3)
        + stats['WEAPON_DAMAGE_BONUS']
        - 3
    )

    // Add crit damage
    if (hit_roll <= stats['CRIT_RATE']) {
        damage += roll_dice(stats['WEAPON_DIE']);
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
        'DAMAGE (Dice)': damage,
        'Wasted Damage': wasted_damage,
        'Misses': misses,
        'Miss%': (misses / stats['SIM_ITERATIONS']) * 100,
        'Average Damage (Dice)': damage / stats['SIM_ITERATIONS'],
        'Average Damage (Dice) (Hits Only)': damage / (stats['SIM_ITERATIONS'] - misses),
        'Average Wasted Damage': wasted_damage / stats['SIM_ITERATIONS'],
        'Average Wasted Damage (Hits Only)': wasted_damage / (stats['SIM_ITERATIONS'] - misses)
    }

}




// Taking damage:
// If attack roll failed, roll RES (
//    Resist – STR/MAG – Resists physical effects (damage, knockback, poison, etc)

