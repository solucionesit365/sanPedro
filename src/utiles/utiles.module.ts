import { Module } from '@nestjs/common';

@Module({})
export class UtilesModule {
    static checkVariable(...args: any[]) {
        // let args = arguments;
        for(let i = 0; i < args.length; i++) {
            if (args[i] == undefined || args[i] == null ) {
                return false;
            }
        }
        return true;
    }
}
