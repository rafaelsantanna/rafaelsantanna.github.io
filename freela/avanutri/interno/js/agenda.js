// Full Calendar
$(document).ready(function () {

  //Initialize Datepicker
  $('[data-toggle="datepicker"]').datepicker({
    language: 'pt-BR',
    format: 'dd/mm/yyyy',
    autoHide: true,
    zIndex: 100000,
    startView: 1,
  });

  //Initialize Clockpicker
  $('#timeSchedule').timepicker();
  $('#info-time-edit').timepicker();

  //Setup Fullcalendar
  $('#calendar').fullCalendar({
    locale: 'pt-BR',
    header: {
      left: 'today prev,next title',
      center: '',
      right: ''
    },
    defaultView: 'agendaWeek',
    allDaySlot: false,
    titleFormat: 'MMMM YYYY',
    themeSystem: 'bootstrap4',
    height: 525,
    events: 'https://api-agenda-rafaeel16.c9users.io/api/schedules',
    dayClick: function (date, jsEvent, view) {
      //reset input
      $('#titleSchedule').val('');
      $('#patientSchedule').val(0);
      $('#timeSchedule').val(date.format('LT'));
      $('#modalSchedule #dateSchedule').val(date.format('l'));

      // show modal schedule
      $('#modalSchedule').css('display', 'flex');
    },
    eventRender: function (event, element) {
      $(element)[0].setAttribute('data-id', event.id);
      $(element)[0].setAttribute('data-title', event.title);
      $(element)[0].setAttribute('data-start', event.start);
      $(element)[0].setAttribute('data-patient', event.patient);
      $(element)[0].setAttribute('onclick', 'scheduleInfos(this)');
    }
  });

  //Close modal Schedule
  $('#modalSchedule .bg-overlay, #modalSchedule .btn-close').click(function () {
    $('#modalSchedule').hide();
  });

  //Close modal Schedule Infos
  $('#modalScheduleInfos .bg-overlay, #modalScheduleInfos .btn-close').click(function () {
    $('#modalScheduleInfos').hide();
  });

  //Save Schedule
  $('#saveSchedule').click(function () {
    var title = $('#titleSchedule').val();
    var date = $('#dateSchedule').val();
    var patient = $('#patientSchedule option:selected').text();
    var time = $('#timeSchedule').val();


    var start = formatToPatternFullcalendar(date, time);

    $.ajax({
      url: 'https://api-agenda-rafaeel16.c9users.io/api/schedules',
      type: "POST",
      data: {
        'title': title,
        'start': start,
        'time': time,
        'patient': patient
      },
      success: function (data) {
        $('#calendar').fullCalendar('renderEvent', {
          id: data.last_insert_id,
          title: title,
          start: start,
          patient: patient,
          time: time
        });
        $('#modalSchedule').hide();
      },
      error: function (e) {
        console.log("Erro: " + e);
      }
    });
  });
});

// Schedule infos
function scheduleInfos(element) {

  var id = $(element).data('id');
  var title = $(element).data('title');
  var patient = $(element).data('patient');
  var start = $(element).data('start');

  $('#info-id').val(id);
  $('#info-title').text(title);
  $('#info-patient').text(patient);
  $('#info-date').text(moment(start).format('l'));
  $('#info-time').text(moment(start).format('LT'));

  // show modal schedule
  $('#modalScheduleInfos').css('display', 'flex');

  // when opening the modal returns to the default
  $('#modalScheduleInfos .wrapper-infos').show();
  $('#modalScheduleInfos .wrapper-infos-edit').hide();
}

function removeEvent() {
  var id = $('#info-id').val();
  $.ajax({
    type: "DELETE",
    url: 'https://api-agenda-rafaeel16.c9users.io/api/schedules/' + id,
    success: function (data) {
      var element = '[data-id="' + $('#info-id').val() + '"]';
      $(element).remove();
      $('#modalScheduleInfos').hide();
    },
    error: function (e) {
      console.log("Erro: " + e);
    }
  });
}

function changeContentModalUpdate() {
  var id = '[data-id="' + $('#info-id').val() + '"]';

  var title = $('#info-title').text();
  var date = $('#info-date').text();
  var time = $('#info-time').text();

  $('#info-title-edit').val(title);
  $('#info-date-edit').val(date);
  $('#info-time-edit').val(time);


  $('#modalScheduleInfos .wrapper-infos').hide();
  $('#modalScheduleInfos .wrapper-infos-edit').show();

  $.fn.setCursorPosition = function (pos) {
    this.each(function (index, elem) {
      if (elem.setSelectionRange) {
        elem.setSelectionRange(pos, pos);
      } else if (elem.createTextRange) {
        var range = elem.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
      }
    });
    return this;
  };

  $('#info-title-edit').focus().setCursorPosition(0);
}

function updateEvent() {
  var id = $('#info-id').val();
  var title = $('#info-title-edit').val();
  var date = $('#info-date-edit').val();
  var time = $('#info-time-edit').val();

  start = formatToPatternFullcalendar(date, time);

  $.ajax({
    type: "PUT",
    url: 'https://api-agenda-rafaeel16.c9users.io/api/schedules/' + id,
    data: {
      'title': title,
      'start': start
    },
    success: function () {
      //reset calendar after update
      $('#calendar').fullCalendar('refetchEvents');
      $("#modalScheduleInfos").hide();
    },
    error: function (e) {
      console.log("Erro: " + e);
    }
  });
}

function formatToPatternFullcalendar(date, time) {
  // Formatting to the fullcalendar pattern
  var formattedDate = moment(moment(date, ['DD-MM-YYYY', 'MM-DD-YYYY'])).format('YYYY-MM-DD');

  // Concatenate to date and time formdateat fullcalendar
  var start = formattedDate + 'T' + time + '-03:00';

  return start;
}