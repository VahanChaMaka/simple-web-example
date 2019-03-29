package ru.grishagin.springreact;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.InternalResourceViewResolver;
import org.springframework.web.servlet.view.JstlView;
import ru.grishagin.springreact.db.EmployeeJDBCTemplate;

import javax.sql.DataSource;

@Configuration
@EnableWebMvc
@ComponentScan("ru.grishagin.springreact")
@Import({ WebSocketConfiguration.class })
public class ApplicationConfig extends WebMvcConfigurerAdapter {

    @Bean
    public DataSource dataSource(){
        DriverManagerDataSource  dataSource = new DriverManagerDataSource();
        //MySQL database we are using
        dataSource.setDriverClassName("com.mysql.jdbc.Driver");
        dataSource.setUrl("jdbc:mysql://localhost:3306/employee");//change url
        dataSource.setUsername("root");//change userid
        dataSource.setPassword("root");//change pwd

        return dataSource;
    }

    @Bean
    public EmployeeJDBCTemplate employeeTemplate(){
        EmployeeJDBCTemplate template = new EmployeeJDBCTemplate();
        template.setDataSource(dataSource());
        return template;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
                .addResourceLocations("/static/");
    }

    @Bean
    public InternalResourceViewResolver setupViewResolver() {
        InternalResourceViewResolver resolver = new InternalResourceViewResolver();
        resolver.setPrefix("/static/templates/");
        resolver.setSuffix(".html");
        resolver.setViewClass(JstlView.class);

        return resolver;
    }
}
