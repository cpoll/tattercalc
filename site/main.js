function json_to_table(json) {
    const table = document.createElement('table');

    for([k, v] of Object.entries(json)){
        const tr = document.createElement('tr');
        table.appendChild(tr);

        const k_column = document.createElement('td');
        k_column.innerHTML = k;
        tr.appendChild(k_column);

        const v_column = document.createElement('td');
        v_column.innerHTML = v;
        tr.appendChild(v_column);
    }

    return table;
}

function add_calculated_fields(stats) {
    stats['REFLEX'] = Math.min(stats['STR'], stats['DEX']);
    stats['RESIST'] = Math.min(stats['STR'], stats['ARC']);
    stats['RESOLVE'] = Math.min(stats['WIS'], stats['ARC']);
    stats['INITIATIVE'] = Math.min(stats['DEX'], stats['WIS']);
}

function calculate(event){
    event.preventDefault()

    // Grab the form data
    const formData = new FormData(event.target);
    const stats = {}
    for ([k, v] of formData.entries()) {
        stats[k] = Number(v);
    }
    console.log(stats);

    // Get the output element
    const output_element = document.getElementById('calc_output');
    output_element.innerHTML = '';

    // Add calculated fields
    add_calculated_fields(stats);

    // Calculate damage
    output_element.appendChild(json_to_table(simulate_damage(stats)));

    // Calculate damage taken
    //output_element.appendChild(calculate_damage_taken(stats));



    // Add stats to output
    output_element.appendChild(json_to_table(stats));

}
