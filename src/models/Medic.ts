import {  Table, Column, Model, DataType, HasMany, Default, Unique, AllowNull} from 'sequelize-typescript';
import Appointment from './Appointment';
import Schedule from './Schedule';


@Table({
    tableName: 'medics'
})
class Medic extends Model {

    @AllowNull(false)
    @Column({
        type: DataType.STRING(50)
    })
    declare name: string;

    @AllowNull(true)
    @Column({
        type: DataType.STRING(50)
    })
    declare phone: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    declare speciality: string;

    @AllowNull(false)
    @Unique(true)
    @Column({
        type: DataType.STRING(50)
    })
    declare email: string;

    // @HasMany(() => Appointment)
    // declare appointments: Appointment[];

    @HasMany(() => Schedule)
    declare schedules: Schedule[];
}

export default Medic;