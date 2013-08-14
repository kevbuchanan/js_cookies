// selectors
var typeInput = 'input[name="batch_type"]'
var timeInput = 'input[name="bake_time"]'
var prepTableUl = '#prep_batches'
var unusedTray = 'li.hidden'

var cookiesId = function(){
  return new Date().getTime()
}

// models

function Cookies(type, time, timeInOven, id){
  this.type = type;
  this.bakeTime = time;
  this.timeInOven = timeInOven;
  this.state = "raw";
  this.id = id
}

Cookies.prototype = {
  bake: function(){
    this.timeInOven++;
    this.updateStatus()
  },
  updateStatus: function(){
    if ( this.timeInOven == 0) {
      this.state = 'raw'
    } else if( this.timeInOven < this.bakeTime ){
      this.state = "still_gooey"
    } else if( this.timeInOven == this.bakeTime ) {
      this.state = "just_right"
    } else {
        this.state = "crispy"
    }
  }
}

function PrepTable(){
  this.batches = []
}

PrepTable.prototype = {
  findCookies: function(id){
    var result = null
    this.batches.forEach(function(element){
      if (element.id == id) {
        result = element
        return false
      }
    })
    return result
  }
}

function Oven(){
  this.batches = []
}

Oven.prototype = {
  addBatch: function(cookies){
    this.batches.push(cookies)
  },
  bakeAll: function(){
    function bakeOne(element, array){
      element.bake()
    }
    this.batches.forEach(bakeOne)
  }
}
var insertIntoPrepTable = function(cookies){
  var prepItem = $(prepTableUl).find(unusedTray).first();
  $(prepItem).data('cookiesId', cookies.id);
  prepTable.batches.push(cookies);
  prepItem.find('.type').text(cookies.type);
  prepItem.removeClass("hidden");
}

// button functions, views

var createBatch = function(tray) {
  var type = tray.find(typeInput).val();
  var time = tray.find(timeInput).val();
  var cookies = new Cookies(type, time, 0, cookiesId());
  insertIntoPrepTable(cookies)
  tray.find(typeInput).val('');
  tray.find(timeInput).val('');
  saveCookiePosition(cookies, 'prepTable')
}

var saveCookiePosition = function(cookies, location) {
  var data = {
    id: cookies.id,
    type: cookies.type,
    bake_time: cookies.bakeTime,
    time_in_oven: cookies.timeInOven,
    location: location,
    status: cookies.state
  }
  $.ajax({url: '/cookies',
        type: 'POST',
        data: {cookie: JSON.stringify(data), id: cookies.id}})
}

var prepTableToOven = function(tray) {
  var id = tray.parent().data('cookiesId')
  var batch = prepTable.findCookies(id)
  oven.addBatch(batch)
  tray.closest('.prep_batch').addClass('hidden')
  putInOven(batch)
  alert('Cookies in the oven!')
  saveCookiePosition(batch, 'oven')
}

var putInOven = function(batch) {
  var rack = $('#oven').find('td:contains("[empty]")').first()
  rack.addClass(batch.state)
  rack.text(batch.type + " ["+batch.state+"]")
}

var bakeCookies = function(){
  oven.bakeAll()
  oven.batches.forEach(function(element, index){
    var rack = $('#oven').find('td')[index]
    $(rack).addClass(element.state)
    $(rack).text(element.type + " ["+element.state+"]")
    saveCookiePosition(element, 'oven')
  })
}

var parseCookies = function(cookies){
  cookies = JSON.parse(cookies);
  cookies.forEach(function(cookie){
    var cookie = JSON.parse(cookie);
    var newCookie = new Cookies(cookie.type, cookie.bake_time, cookie.time_in_oven, cookie.id)
    newCookie.updateStatus()
    if (cookie.location == 'prepTable') {
      insertIntoPrepTable(newCookie)
    }
    else {
      oven.addBatch(newCookie)
      putInOven(newCookie)
    }
  })
}

// controllers

oven = new Oven()
prepTable = new PrepTable()

$(document).ready(function(){
  $.get('/cookies', 'json')
    .done(function(response){
      parseCookies(response);
  });

  $('form').on('submit', function(event) {
    event.preventDefault()
    createBatch($(this))
  })

  $('.prep_batch').on('click', 'button', function(event){
    prepTableToOven($(this))
  })

  $('#bake').on('click', function(event) {
    bakeCookies()
  })
})
