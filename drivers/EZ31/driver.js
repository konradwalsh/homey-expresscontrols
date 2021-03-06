'use strict';
const path = require('path');
const ZwaveDriver = require('homey-zwavedriver');
const util = require('util');
let oldTemp = -100; // to compare with new temp   in trigger
let newTemp = -100;  // measured temp 
// http://www.cd-jackson.com/zwave_device_uploads/355/9-Multisensor-6-V1-07.pdf
module.exports = new ZwaveDriver (path.basename(__dirname), {
    init: (devices_data, callback) => {
                 util.log('this is init driver');
                 CommandClass.COMMAND_CLASS_CONFIGURATION.CONFIGURATION_GET( {'Parameter Number': 7}, null 
	     );                
	   },

        capabilities: {
		measure_battery: {
			command_class: 'COMMAND_CLASS_BATTERY',
			command_get: 'BATTERY_GET',
			command_report: 'BATTERY_REPORT',
			command_report_parser: report => {
				if (report['Battery Level'] === 'battery low warning') return 1;
				if (report.hasOwnProperty('Battery Level (Raw)')) return report['Battery Level (Raw)'][0];
				return null;
			}
		},
		alarm_motion: {
		            command_class: 'COMMAND_CLASS_BASIC',
                    command_report: 'BASIC_SET',
                    command_report_parser: report => {
                    report['Value'] > 0
                  return  (report['Value'] > 0)
                    },			
                 'pollInterval': "poll_interval",
                  'getOnWakeUp': true,                
            },
		measure_temperature: {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_get: 'SENSOR_MULTILEVEL_GET',
			command_get_parser: () => ({
				'Sensor Type': 'Temperature (version 1)',
				'Properties1': {
					'Scale': 1,
				},
			}),
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => {
				if (report.hasOwnProperty('Sensor Type') && report.hasOwnProperty('Sensor Value (Parsed)')) {
					if (report['Sensor Type'] === 'Temperature (version 1)') return Number(((report['Sensor Value (Parsed)'] - 32) / 1.8).toFixed(1));
				}
				return null;
			}			
		},

		measure_luminance:
                {                  
                   command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
                    command_get: 'SENSOR_MULTILEVEL_GET',
                    command_get_parser: () => {
                        return {
                            'Sensor Type': 'Luminance (version 1)',
                            'Properties1': {
                                'Scale': 0
                            }
                        };
                    },
                    command_report: 'SENSOR_MULTILEVEL_REPORT',
                    command_report_parser: report => {
                        if (report['Sensor Type'] === 'Luminance (version 1)' &&
                            report.hasOwnProperty("Level") &&
                            report.Level.hasOwnProperty("Scale") &&
                            report.Level.Scale === 0)
                            return report['Sensor Value (Parsed)'];
                    },
                    'getOnWakeUp': true,
                    'pollInterval': "poll_interval"
                

            },
	},

            settings : {                       // sensitivity default - 56  range 0 -- 1   0 255  -56 255-56 199
                1: {
                    index: 1,
                    size: 1
                },
                2: {
                    index: 2,                 // on time  range  0 -- 1
                    size: 1
                },
                3: {                          //led  off = 0 or 1       r -1 = on 
                    index: 3,
                    size: 1
                },
                4: {                         // light treshold between 0 and 100 %  
                    index: 4,
                    size: 1,
                    'signed': false
                },
                5: {                          // stay awake 0 => No   1, -1 => Yes
                    index: 5,                //The WakeUpTime can be configured from 0.1 to 25.0 hours in 6 minute (tenths of an hour) increments. 
                    size: 1
                },
               6: {                         // value send with basic set on command 
                    index: 6,
                    size: 1
                },
               7: {                         // TempAdj
                    index: 7,
                    size: 1,
                    'signed': true
               },
              8: {                         // set reporting cpability Bit 0=Temperature Bit 1= LuminanceBit 2= Battery level
                   index: 8,                //  0= off 1 = 1 7 is all on
                   size: 1
               }
            }
}); // driver