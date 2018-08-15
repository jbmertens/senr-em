
class SENRSimulation
{

// class constructor
  constructor()
  {
    console.log("Initializing SENRSimulation class.");

    var self = this;
    self.is_running = false;
    self.n_steps_run = 0;

    self.fields = [
      { val: 0, text: "vetU0"} ,
      { val: 1, text: "vetU1"} ,
      { val: 2, text: "vetU2"} ,
      { val: 3, text: "hDD00"} ,
      { val: 4, text: "hDD01"} ,
      { val: 5, text: "hDD02"} ,
      { val: 6, text: "hDD11"} ,
      { val: 7, text: "hDD12"} ,
      { val: 8, text: "hDD22"} ,
      { val: 9, text: "cf"} ,
      { val: 10, text: "alpha"} ,
      { val: 11, text: "aDD00"} ,
      { val: 12, text: "aDD01"} ,
      { val: 13, text: "aDD02"} ,
      { val: 14, text: "aDD11"} ,
      { val: 15, text: "aDD12"} ,
      { val: 16, text: "aDD22"} ,
      { val: 17, text: "trK"} ,
      { val: 18, text: "lambdaU0"} ,
      { val: 19, text: "lambdaU1"} ,
      { val: 20, text: "lambdaU2"} ,
      { val: 21, text: "betU0"} ,
      { val: 22, text: "betU1"} ,
      { val: 23, text: "betU2"} ,
    ];
    self.fieldPlotted = 1;

    $('#control #play').on('click', function() {
      console.log("Setting simulation to running.");
      self.is_running = true;
    });

    $('#control #pause').on('click', function() {
      console.log("Setting simulation to paused.");
      self.is_running = false;
    });

    var select = $('<select>');
    $(self.fields).each(function() {
      select.append($("<option>").attr('value', this.val).text(this.text));
    });
    select.change(function() {
      var sel = this;
      self.fieldPlotted = sel.value;
      self.updatePlotData(sel.value);
    });
    $('#field').append(select);

    Module._init_sim();
    Module._run_sim(1);
    self.showPlot(1);
    self.runSim();
  }

  runSim()
  {
    var self = this;
    async_recurse_with_test(100, self.runStep, {'self': self}, self.isRunning, {'self': self});
  }

  runStep(_self)
  {
    var self = _self['self'];
    Module._run_sim(1);
    self.n_steps_run++;
    $('#counter').text(self.n_steps_run);
    self.updatePlotData(self.fieldPlotted);
  }

  isRunning(_self)
  {
    return _self['self'].is_running;
  }

  showPlot(g)
  {
    var self = this;
    var data = [
      {
        z: get_sub_arr(g),
        type: 'heatmapgl'
      }
    ];
    Plotly.newPlot('display', data);
  }

  updatePlotData(g)
  {
    console.log('Updating plot data, showing field', g, '.');
    Plotly.restyle('display', {z: [get_sub_arr(g)]});
  }

} // SENRSimulation class



function sleep(ms)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function async_recurse_with_test(sleep_time, call, call_args, test, test_args)
{
  if(test(test_args)) {
    call(call_args);
  }

  await sleep(sleep_time);
  async_recurse_with_test(sleep_time, call, call_args, test, test_args);
}


function get_sub_arr(g)
{
  var gfs_ptr_F64 = Module._get_gfs()/8;
  var gfs_size = Module._get_gfs_size();
  var gfs_arr = Module.HEAPF64.subarray( gfs_ptr_F64, gfs_ptr_F64 + gfs_size );

  var nx = 128;
  var ny = 32;
  var nz = 2;

  var NGHOSTS = 3;
  var Npts1 = nx+2*NGHOSTS;
  var Npts2 = ny+2*NGHOSTS;
  var Npts3 = nz+2*NGHOSTS;

  var sub_arr = new Array(ny);
  for (var j=0; j<ny; j++) {
    sub_arr[j] = new Array(nx);
    for (var i=0; i<nx; i++) {
      var k = 0;
      var idx = (i+NGHOSTS) + Npts1*( (j+NGHOSTS) + Npts2*( (k+NGHOSTS) + Npts3*g ) );
      sub_arr[j][i] = gfs_arr[idx];
    }
  }

  return sub_arr;
}

