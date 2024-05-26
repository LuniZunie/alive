import baseCodons from '/assets/data/json/base_codon.json' with { type: 'json' };
import stopCodons from '/assets/data/json/stop_codon.json' with { type: 'json' };

stopCodons.forEach(function(v) {
  baseCodons[v].stop = 1;
});

console.log(JSON.stringify(baseCodons));