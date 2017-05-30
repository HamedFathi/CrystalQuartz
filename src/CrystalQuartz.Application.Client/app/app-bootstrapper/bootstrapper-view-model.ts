﻿import { CommandService } from '../services';
import { GetEnvironmentDataCommand, GetDataCommand } from '../commands/global-commands';
import { SchedulerData } from '../api';
import { ApplicationModel } from '../application-model';
import { DataLoader } from '../data-loader';
import ApplicationViewModel from '../application-view-model';

export default class BootstrapperViewModel {
    statusMessage = new js.ObservableValue<string>();
    status = new js.ObservableValue<boolean>();

    applicationViewModel: ApplicationViewModel;

    start() {
        const commandService = new CommandService(),
              applicationModel = new ApplicationModel(),
              dataLoader = new DataLoader(applicationModel, commandService);

        commandService.onCommandFailed.listen(console.log); // todo

        this.applicationViewModel = new ApplicationViewModel(applicationModel, commandService);

        this.statusMessage.setValue('Loading environment settings');
        const initPromise = commandService.executeCommand(new GetEnvironmentDataCommand).then(envData => {
            this.statusMessage.setValue('Loading initial scheduler data');
            return commandService.executeCommand<SchedulerData>(new GetDataCommand()).then(schedulerData => {
                return {
                    envData: envData,
                    schedulerData: schedulerData
                };
            });
        });

        // todo: handle failed state
        initPromise.done(data => {
            /**
             * That would trigger application services.
             */
            applicationModel.setData(data.schedulerData);
            this.status.setValue(true);
        });
    }
}