// "use client";
// import React, { useRef } from "react";
// import { Day, Week, WorkWeek, Month, Agenda, ScheduleComponent, ResourcesDirective, ResourceDirective, Inject, Resize, DragAndDrop } from '@syncfusion/ej2-react-schedule';
// import { extend, Predicate, Query } from "@syncfusion/ej2-data";


// import { registerLicense } from "@syncfusion/ej2-base";
// import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
// import { PropertyPane } from './property-pane';


// import dataSource from "@/data/appointmentData";
// import "@syncfusion/ej2-react-schedule/styles/bootstrap5.css";
// import "@syncfusion/ej2-base/styles/bootstrap5.css";

// registerLicense(
//   "Ngo9BigBOggjHTQxAR8/V1NMaF5cXmBCfEx3TXxbf1x1ZFREalxQTnVYUiweQnxTdEBjWH5XcHRVR2RcWEN3Xw=="
// );

// export class Resource extends SampleBase {
//   scheduleObj;
//   ownerOneObj;
//   ownerTwoObj;
//   ownerThreeObj;
//   data = extend([], dataSource.resourceSampleData, null, true);
//   resourceData = [
//       { Text: 'Margaret', Id: 1, Color: '#ea7a57' },
//       { Text: 'Robert', Id: 2, Color: '#df5286' },
//       { Text: 'Laura', Id: 3, Color: '#865fcf' }
//   ];
//   onChange() {
//       let predicate;
//       let proxy = this;
//       let checkBoxes = [this.ownerOneObj, this.ownerTwoObj, this.ownerThreeObj];
//       checkBoxes.forEach((checkBoxObj) => {
//           if (checkBoxObj.checked) {
//               if (predicate) {
//                   predicate = predicate.or('OwnerId', 'equal', parseInt(checkBoxObj.value, 10));
//               }
//               else {
//                   predicate = new Predicate('OwnerId', 'equal', parseInt(checkBoxObj.value, 10));
//               }
//           }
//       });
//       proxy.scheduleObj.eventSettings.query = new Query().where(predicate);
//   }
//   render() {
//       return (<div className='schedule-control-section'>
//               <div className='col-lg-9 control-section'>
//                   <div className='control-wrapper'>
//                       <ScheduleComponent cssClass='resource' width='100%' height='650px' selectedDate={new Date(2021, 5, 6)} ref={schedule => this.scheduleObj = schedule} eventSettings={{ dataSource: this.data }}>
//                           <ResourcesDirective>
//                               <ResourceDirective field='OwnerId' title='Owners' name='Owners' allowMultiple={true} dataSource={this.resourceData} textField='Text' idField='Id' colorField='Color'>
//                               </ResourceDirective>
//                           </ResourcesDirective>
//                           <Inject services={[Day, Week, WorkWeek, Month, Agenda, Resize, DragAndDrop]}/>
//                       </ScheduleComponent>
//                   </div>
//               </div>
//               <div className='col-lg-3 property-section'>
//                   <PropertyPane title='Properties'>
//                       <table id="property" title="Resources" className='property-panel-table'>
//                           <tbody>
//                               <tr>
//                                   <td>
//                                       <CheckBoxComponent ref={checkboxObj => this.ownerOneObj = checkboxObj} value='1' id='margaret' cssClass='margaret' checked={true} label='Margaret' change={this.onChange.bind(this)}></CheckBoxComponent>
//                                   </td>
//                               </tr>
//                               <tr>
//                                   <td>
//                                       <CheckBoxComponent ref={checkboxObj => this.ownerTwoObj = checkboxObj} value='2' id='robert' cssClass='robert' checked={true} label='Robert' change={this.onChange.bind(this)}></CheckBoxComponent>
//                                   </td>
//                               </tr>
//                               <tr>
//                                   <td>
//                                       <CheckBoxComponent ref={checkboxObj => this.ownerThreeObj = checkboxObj} value='3' id='laura' cssClass='laura' checked={true} label='Laura' change={this.onChange.bind(this)}></CheckBoxComponent>
//                                   </td>
//                               </tr>
//                           </tbody>
//                       </table>
//                   </PropertyPane>
//               </div>
//           </div>);
//   }
// }

// export default Resource;
