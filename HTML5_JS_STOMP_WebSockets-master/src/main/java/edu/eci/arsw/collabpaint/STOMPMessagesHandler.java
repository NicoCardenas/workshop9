package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import java.util.ArrayList;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class STOMPMessagesHandler {
	
	@Autowired
	SimpMessagingTemplate msgt;
        
        public HashMap<String,ArrayList<Point>> poligonos = new HashMap<>();
    
	@MessageMapping("/newpoint.{numdibujo}")
	public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
                
            if(!poligonos.containsKey(numdibujo)){
                poligonos.put(numdibujo,new ArrayList<Point>());
            }
            else{
                if(poligonos.get(numdibujo).size()<=3){
                    poligonos.get(numdibujo).add(pt);
                }
                else{
                    poligonos.clear();
                    poligonos.put(numdibujo,new ArrayList<Point>());
                    poligonos.get(numdibujo).add(pt);

                }
                System.out.println("Nuevo punto recibido en el servidor!: "+pt);
                msgt.convertAndSend("/topic/newpoint."+numdibujo,pt);
            }
            System.out.println("lista: "+ poligonos.toString());
            if(poligonos.get(numdibujo).size()>=3){
                System.out.println("Nuevo poligono recibido en el servidor!: "+poligonos.get(numdibujo));
                msgt.convertAndSend("/topic/newpolygon."+numdibujo, poligonos.get(numdibujo));
            }
	}
}
