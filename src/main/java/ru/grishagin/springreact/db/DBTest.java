package ru.grishagin.springreact.db;

import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.context.support.AbstractApplicationContext;
import ru.grishagin.springreact.ApplicationConfig;

public class DBTest {
    public static void main(String[] args) {
        AbstractApplicationContext context = new AnnotationConfigApplicationContext(ApplicationConfig.class);

        EmployeeJDBCTemplate template = context.getBean(EmployeeJDBCTemplate.class);
        //template.create("Vasya", "Pupkin", "security");
        for (Employee employee : template.listEmployees(0, 10)) {
            System.out.println(employee);
        }

        /*template.create("John", "Smith", "developer");
        template.create("Misha", "Ershov", "manager");
        template.create("Lee", "Chou", "doctor");
        template.create("Simith", "Pawandar", "driver");*/
    }
}
